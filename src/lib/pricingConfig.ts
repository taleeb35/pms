// Centralized Zonoir subscription pricing (matches zonoir.com):
// $35 per practitioner per month, limited-time price down from $49. Staff accounts are free.
// Use these everywhere Zonoir's own price is shown (signup, subscription pages, admin, emails).

export const PRICE_CURRENCY = "USD";
export const PRICE_ORIGINAL = 49;            // regular price per practitioner per month
export const PRICE_MONTHLY = 35;             // current price per practitioner per month
export const PRICE_DISCOUNT_PERCENT = Math.round((1 - PRICE_MONTHLY / PRICE_ORIGINAL) * 100);
export const YEARLY_DISCOUNT = 0.17;         // extra saving on the yearly plan
export const PRICE_YEARLY_MONTHLY = Math.round(PRICE_MONTHLY * (1 - YEARLY_DISCOUNT) * 100) / 100; // per month, billed yearly
export const PRICE_YEARLY = Math.round(PRICE_MONTHLY * 12 * (1 - YEARLY_DISCOUNT) * 100) / 100;     // per year

/** "$35", "$29.05", "$1,050" */
export const usd = (n: number | string | null | undefined): string => {
  const v = Number(n) || 0;
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });
};

// Older names kept so existing imports keep working; all now point at the USD prices.
export const USD_ORIGINAL_PRICE = PRICE_ORIGINAL;
export const USD_DISCOUNT_PERCENT = PRICE_DISCOUNT_PERCENT;
export const USD_DISCOUNTED_PRICE = PRICE_MONTHLY;
export const USD_YEARLY_DISCOUNT = YEARLY_DISCOUNT;
export const USD_YEARLY_MONTHLY_RATE = PRICE_YEARLY_MONTHLY;
export const PKR_ORIGINAL_PRICE = PRICE_ORIGINAL;
export const PKR_DISCOUNT_PERCENT = PRICE_DISCOUNT_PERCENT;
export const PKR_DISCOUNTED_PRICE = PRICE_MONTHLY;
export const PKR_YEARLY_DISCOUNT = YEARLY_DISCOUNT;
export const PKR_YEARLY_MONTHLY_RATE = PRICE_YEARLY_MONTHLY;
export const PKR_YEARLY_RATE = PRICE_YEARLY;
