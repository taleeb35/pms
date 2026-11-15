// Doctor names are sometimes saved with "Dr." already in front.
// Use these helpers so the title is shown exactly once.
const DR = /^\s*(dr\.?|doctor)\s+/i;

export const stripDrTitle = (name?: string | null): string => (name ?? "").replace(DR, "").trim();

export const withDrTitle = (name?: string | null): string => {
  const bare = stripDrTitle(name);
  return bare ? `Dr. ${bare}` : "";
};
