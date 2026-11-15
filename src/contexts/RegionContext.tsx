import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_REGION, formatMoney, currencySymbol, setActiveRegion, type Region } from "@/lib/region";

type RegionCtx = Region & {
  loading: boolean;
  money: (amount: number | string | null | undefined) => string;
  symbol: string;
  refresh: () => Promise<void>;
  save: (next: Pick<Region, "country_code" | "currency_code" | "timezone">) => Promise<{ error?: string }>;
};

const Ctx = createContext<RegionCtx | null>(null);

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setRegion(DEFAULT_REGION); setActiveRegion(DEFAULT_REGION); setLoading(false); return; }
    const { data, error } = await supabase.rpc("get_my_region" as any);
    if (!error && data) { const r = { ...DEFAULT_REGION, ...(data as any) }; setActiveRegion(r); setRegion(r); }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const save: RegionCtx["save"] = async (next) => {
    const { data, error } = await supabase.rpc("update_my_region" as any, {
      p_country: next.country_code, p_currency: next.currency_code, p_timezone: next.timezone,
    });
    if (error) return { error: error.message };
    if (data) { const r = { ...DEFAULT_REGION, ...(data as any) }; setActiveRegion(r); setRegion(r); }
    return {};
  };

  const value: RegionCtx = {
    ...region,
    loading,
    money: (a) => formatMoney(a, region.currency_code),
    symbol: currencySymbol(region.currency_code),
    refresh,
    save,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

/** Region settings of the signed-in user's clinic (or solo doctor). Safe outside the provider. */
export const useRegion = (): RegionCtx => {
  const v = useContext(Ctx);
  if (v) return v;
  return {
    ...DEFAULT_REGION, loading: false,
    money: (a) => formatMoney(a, DEFAULT_REGION.currency_code),
    symbol: currencySymbol(DEFAULT_REGION.currency_code),
    refresh: async () => {}, save: async () => ({ error: "Region settings are not available here" }),
  };
};
