/**
 * Jambi Province Data Constants
 *
 * This file contains the official administrative divisions of Jambi Province
 * for use throughout the PJUTS monitoring application.
 */

// Province constant
export const JAMBI_PROVINCE = "Jambi";

// All 11 regencies/cities in Jambi Province
// Sorted alphabetically with cities (Kota) first, then regencies (Kabupaten)
export const JAMBI_REGENCIES = [
  // Cities (Kota)
  "Kota Jambi",
  "Kota Sungai Penuh",
  // Regencies (Kabupaten)
  "Kabupaten Batanghari",
  "Kabupaten Bungo",
  "Kabupaten Kerinci",
  "Kabupaten Merangin",
  "Kabupaten Muaro Jambi",
  "Kabupaten Sarolangun",
  "Kabupaten Tanjung Jabung Barat",
  "Kabupaten Tanjung Jabung Timur",
  "Kabupaten Tebo",
] as const;

// Type for regency values
export type JambiRegency = (typeof JAMBI_REGENCIES)[number];

// Example districts for common regencies (for placeholder hints)
export const EXAMPLE_DISTRICTS: Record<string, string> = {
  "Kota Jambi": "Telanaipura",
  "Kota Sungai Penuh": "Sungai Penuh",
  "Kabupaten Batanghari": "Muara Bulian",
  "Kabupaten Bungo": "Muara Bungo",
  "Kabupaten Kerinci": "Siulak",
  "Kabupaten Merangin": "Bangko",
  "Kabupaten Muaro Jambi": "Sengeti",
  "Kabupaten Sarolangun": "Sarolangun",
  "Kabupaten Tanjung Jabung Barat": "Kuala Tungkal",
  "Kabupaten Tanjung Jabung Timur": "Muara Sabak",
  "Kabupaten Tebo": "Muara Tebo",
};
