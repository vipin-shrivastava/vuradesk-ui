/**
 * Formats a date from the backend, which can be a string or a number array.
 * @param dateArray - The date data, e.g., [2023, 10, 27, 10, 0, 0] or a date string.
 * @returns A formatted date string (e.g., "10/27/2023").
 */
export const formatBackendDate = (dateArray: string | number[]): string => {
  if (!dateArray) return 'N/A';

  if (Array.isArray(dateArray) && dateArray.length >= 6) {
    // Assuming [year, month, day, hour, minute, second]
    const [year, month, day, hour, minute, second] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second).toLocaleDateString();
  }

  // Fallback for standard ISO date strings or other parsable formats
  const date = new Date(dateArray as string);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString();
};
