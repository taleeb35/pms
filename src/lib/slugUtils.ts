/**
 * Utility functions for generating and parsing SEO-friendly slugs
 */

/**
 * Generates a URL-friendly slug from a doctor's name
 * e.g., "Dr. Mariam Khalid" -> "dr-mariam-khalid"
 */
export const generateDoctorSlug = (fullName: string): string => {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

/**
 * Generates a URL-friendly slug from a city name
 * e.g., "Lahore" -> "lahore"
 */
export const generateCitySlug = (city: string): string => {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Generates a URL-friendly slug from a specialty
 * e.g., "ENT Specialist" -> "ent-specialist"
 */
export const generateSpecialtySlug = (specialty: string): string => {
  return specialty
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Converts a slug back to display format
 * e.g., "dr-mariam-khalid" -> "Dr Mariam Khalid"
 */
export const slugToDisplayName = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generates the full SEO URL for a doctor profile
 */
export const generateDoctorProfileUrl = (
  city: string,
  specialty: string,
  fullName: string
): string => {
  const citySlug = generateCitySlug(city);
  const specialtySlug = generateSpecialtySlug(specialty);
  const doctorSlug = generateDoctorSlug(fullName);
  return `/doctors/${citySlug}/${specialtySlug}/${doctorSlug}`;
};
