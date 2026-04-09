// Centralized pricing configuration
// Original price with launch discount applied across the system

// USD pricing (for public-facing pages)
export const USD_ORIGINAL_PRICE = 80; // Original price per doctor per month
export const USD_DISCOUNT_PERCENT = 75; // Launch discount percentage
export const USD_DISCOUNTED_PRICE = 19.99; // Final price after discount
export const USD_YEARLY_DISCOUNT = 0.17; // Additional 17% off for yearly

// PKR pricing (for doctor/clinic internal pages)  
export const PKR_ORIGINAL_PRICE = 23999; // Original price per doctor per month
export const PKR_DISCOUNT_PERCENT = 75; // Launch discount percentage
export const PKR_DISCOUNTED_PRICE = 5999; // Final price after discount
export const PKR_YEARLY_DISCOUNT = 0.17; // Additional 17% off for yearly

// Computed yearly rates
export const USD_YEARLY_MONTHLY_RATE = Math.round((USD_DISCOUNTED_PRICE * (1 - USD_YEARLY_DISCOUNT)) * 100) / 100;
export const PKR_YEARLY_MONTHLY_RATE = Math.round(PKR_DISCOUNTED_PRICE * (1 - PKR_YEARLY_DISCOUNT));
export const PKR_YEARLY_RATE = Math.round(PKR_DISCOUNTED_PRICE * 12 * (1 - PKR_YEARLY_DISCOUNT));
