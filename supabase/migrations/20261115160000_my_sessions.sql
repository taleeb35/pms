-- H2: let users see and end their own signed-in sessions (devices).
create or replace function public.get_my_sessions()
returns table (id uuid, created_at timestamptz, last_active timestamptz, user_agent text, ip text, aal text, is_current boolean)
language sql stable security definer set search_path = public, auth
as $$
  select s.id, s.created_at, coalesce(s.refreshed_at, s.updated_at, s.created_at), s.user_agent, host(s.ip),
         s.aal::text, s.id::text = coalesce(auth.jwt() ->> 'session_id', '')
    from auth.sessions s
   where s.user_id = auth.uid()
     and (s.not_after is null or s.not_after > now())
   order by 3 desc nulls last;
$$;

-- Ending a session revokes its refresh token; the device is signed out when its current access token expires (within the hour).
create or replace function public.revoke_my_session(p_session_id uuid)
returns boolean
language plpgsql security definer set search_path = public, auth
as $$
begin
  delete from auth.sessions where id = p_session_id and user_id = auth.uid();
  return found;
end $$;

revoke all on function public.get_my_sessions() from public;
revoke all on function public.revoke_my_session(uuid) from public;
grant execute on function public.get_my_sessions() to authenticated;
grant execute on function public.revoke_my_session(uuid) to authenticated;
