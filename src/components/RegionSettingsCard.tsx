import { useEffect, useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRegion } from "@/contexts/RegionContext";
import { countryOptions, currencyOptions, timezoneOptions, currencyForCountry, formatMoney } from "@/lib/region";

// Country, currency and timezone for the clinic (or solo doctor).
// Shown read-only to doctors and staff inside a clinic.
const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

const RegionSettingsCard = () => {
  const region = useRegion();
  const { toast } = useToast();
  const [country, setCountry] = useState(region.country_code);
  const [currency, setCurrency] = useState(region.currency_code);
  const [timezone, setTimezone] = useState(region.timezone);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCountry(region.country_code); setCurrency(region.currency_code); setTimezone(region.timezone);
  }, [region.country_code, region.currency_code, region.timezone]);

  const countries = useMemo(countryOptions, []);
  const currencies = useMemo(currencyOptions, []);
  const timezones = useMemo(timezoneOptions, []);
  const canEdit = !!region.can_edit;
  const dirty = country !== region.country_code || currency !== region.currency_code || timezone !== region.timezone;

  const onSave = async () => {
    setSaving(true);
    const { error } = await region.save({ country_code: country, currency_code: currency, timezone });
    setSaving(false);
    if (error) toast({ title: "Could not save", description: error, variant: "destructive" });
    else {
      toast({ title: "Saved", description: "Country, currency and timezone updated for everyone in your account." });
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Country, currency and timezone</CardTitle>
        <CardDescription>
          {canEdit
            ? "Used for money amounts, appointment times, phone numbers and ID labels across your account."
            : "Set by your clinic owner. Ask them to change it."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="region-country">Country</Label>
            <select id="region-country" className={selectCls} value={country} disabled={!canEdit}
              onChange={(e) => { setCountry(e.target.value); setCurrency(currencyForCountry(e.target.value)); }}>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region-currency">Currency</Label>
            <select id="region-currency" className={selectCls} value={currency} disabled={!canEdit}
              onChange={(e) => setCurrency(e.target.value)}>
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region-timezone">Timezone</Label>
            <select id="region-timezone" className={selectCls} value={timezone} disabled={!canEdit}
              onChange={(e) => setTimezone(e.target.value)}>
              {timezones.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Example amount: {formatMoney(1500, currency)}</p>
        {canEdit && (
          <Button onClick={onSave} disabled={saving || !dirty}>{saving ? "Saving..." : "Save"}</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionSettingsCard;
