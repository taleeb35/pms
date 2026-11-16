#!/usr/bin/env python3
"""Zonoir health check (0.17). Runs every 5 minutes from root's crontab.
Checks the live site, login and database API, Docker services, disk, backups and the SSL
certificate. Emails hello@zonoir.com (via Resend) when something fails twice in a row,
again every 6 hours while it stays broken, and once when it recovers.
Log: /var/log/zonoir-health.log   State: /var/lib/zonoir-health/state.json"""
import json, os, re, ssl, socket, subprocess, time, urllib.request
from datetime import datetime, timezone

ENV = "/opt/zonoir-supabase/stack/.env"
STATE = "/var/lib/zonoir-health/state.json"
LOG = "/var/log/zonoir-health.log"
SITE = "https://app.zonoir.com"
ALERT_TO = os.environ.get("ZONOIR_ALERT_TO", "hello@zonoir.com")
FROM = "Zonoir System <noreply@zonoir.com>"
REMIND_EVERY = 6 * 3600

env = dict(re.findall(r"^([A-Z_]+)=(.*)$", open(ENV).read(), re.M))
anon = env.get("ANON_KEY", "").strip('"')
resend = env.get("RESEND_API_KEY", "").strip('"')

def http(url, headers=None, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": "zonoir-health", **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return str(e)[:80]

def checks():
    out = {}
    s = http(SITE + "/"); out["Website"] = None if s == 200 else f"home page returned {s}"
    s = http(SITE + "/auth/v1/health", {"apikey": anon}); out["Login service"] = None if s == 200 else f"auth health returned {s}"
    s = http(SITE + "/rest/v1/specializations?select=id&limit=1", {"apikey": anon, "Authorization": f"Bearer {anon}"}); out["Database API"] = None if s == 200 else f"REST returned {s}"
    try:
        rows = subprocess.run(["docker", "ps", "-a", "--filter", "name=supabase", "--format", "{{.Names}}|{{.Status}}"], capture_output=True, text=True, timeout=30).stdout.strip().splitlines()
        rows += subprocess.run(["docker", "ps", "-a", "--filter", "name=realtime", "--format", "{{.Names}}|{{.Status}}"], capture_output=True, text=True, timeout=30).stdout.strip().splitlines()
        bad = [r.split("|")[0] for r in set(rows) if not r.split("|")[1].startswith("Up") or "unhealthy" in r]
        out["Services"] = f"not running or unhealthy: {', '.join(sorted(bad))}" if bad else (None if rows else "no Docker services found")
    except Exception as e:
        out["Services"] = f"could not ask Docker: {e}"
    st = os.statvfs("/"); used = 100 - st.f_bavail * 100 // st.f_blocks
    out["Disk space"] = None if used < 85 else f"disk {used}% full"
    try:
        dirs = [d for d in os.listdir("/var/backups/zonoir") if re.match(r"\d{4}-\d{2}-\d{2}_\d{4}$", d)]
        newest = max(os.path.getmtime(os.path.join("/var/backups/zonoir", d)) for d in dirs)
        age = (time.time() - newest) / 3600
        out["Backups"] = None if age < 26 else f"newest backup is {age:.0f} hours old"
    except Exception as e:
        out["Backups"] = f"no backups found ({e})"
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection(("app.zonoir.com", 443), timeout=10) as sock, ctx.wrap_socket(sock, server_hostname="app.zonoir.com") as tls:
            exp = datetime.strptime(tls.getpeercert()["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        days = (exp - datetime.now(timezone.utc)).days
        out["SSL certificate"] = None if days >= 14 else f"expires in {days} days"
    except Exception as e:
        out["SSL certificate"] = f"could not check: {str(e)[:80]}"
    return out

def send(subject, body):
    if not resend:
        return "no RESEND_API_KEY"
    data = json.dumps({"from": FROM, "to": [ALERT_TO], "subject": subject, "text": body}).encode()
    req = urllib.request.Request("https://api.resend.com/emails", data=data, method="POST",
        headers={"Authorization": f"Bearer {resend}", "Content-Type": "application/json", "User-Agent": "zonoir-health"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return f"{e.code} {e.read()[:200]!r}"
    except Exception as e:
        return str(e)[:120]

def log(msg):
    with open(LOG, "a") as f:
        f.write(f"{datetime.now(timezone.utc):%Y-%m-%d %H:%M:%S} {msg}\n")

def main():
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    state = json.load(open(STATE)) if os.path.exists(STATE) else {}
    res = checks(); now = time.time(); stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    problems = []
    for name, err in res.items():
        s = state.get(name, {"fails": 0, "alerted": 0})
        if err:
            s["fails"] += 1; s["last_error"] = err
            if s["fails"] >= 2 and (not s["alerted"] or now - s["alerted"] > REMIND_EVERY):
                problems.append(f"- {name}: {err}"); s["alerted"] = now
        else:
            if s.get("alerted"):
                r = send(f"Zonoir recovered: {name}", f"{name} is working again ({stamp}).\nThe last problem was: {s.get('last_error')}")
                log(f"RECOVERED {name} (mail {r})")
            s = {"fails": 0, "alerted": 0}
        state[name] = s
    if problems:
        body = "Zonoir health check found a problem on app.zonoir.com (" + stamp + "):\n\n" + "\n".join(problems) + \
               "\n\nThis check runs every 5 minutes on the server. You will get one email when it is fixed, and a reminder every 6 hours until then."
        r = send("Zonoir alert: " + ", ".join(p[2:].split(":")[0] for p in problems), body)
        log("ALERT " + " | ".join(problems) + f" (mail {r})")
    failing = [f"{k}: {v}" for k, v in res.items() if v]
    log("OK" if not failing else "FAIL " + " | ".join(failing))
    json.dump(state, open(STATE, "w"))

if __name__ == "__main__":
    import sys
    if "--test-email" in sys.argv:
        print("mail:", send("Zonoir health check is on", "This is a test from the new Zonoir health check on the server.\nIt checks the website, login, database API, services, disk, backups and SSL every 5 minutes, and emails this address if something breaks."))
    elif "--dry-run" in sys.argv:
        print(json.dumps(checks(), indent=1))
    else:
        main()
