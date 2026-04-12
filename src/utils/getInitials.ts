export const getInitials = (firstName?: string, lastName?: string, fallback: string = '?'): string => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName[0].toUpperCase();
  }
  if (lastName) {
    return lastName[0].toUpperCase();
  }
  return fallback;
};
