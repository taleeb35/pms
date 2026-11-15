// B4: consultation-time metric rules.
// Visits longer than MAX_CONSULT_MINUTES are ignored (forgotten "Complete" clicks),
// and no average is shown until there are at least MIN_CONSULT_SAMPLE timed visits.
export const MAX_CONSULT_MINUTES = 180;
export const MIN_CONSULT_SAMPLE = 5;
