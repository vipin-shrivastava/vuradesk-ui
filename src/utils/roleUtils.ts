/**
 * Maps user role names to URL-friendly slugs.
 *
 * @param role The role name (e.g., 'ADMIN', 'AGENT', 'SUB_ADMIN', 'CUSTOMER')
 * @returns A URL-friendly slug (e.g., 'admin', 'agent', 'sub-admin', 'customer')
 */
export const getRoleSlug = (role: string | null | undefined): string => {
  if (!role) return 'workspace'; // Fallback for general workspace

  const normalizedRole = role.toUpperCase();
  
  switch (normalizedRole) {
    case 'ADMIN':
      return 'admin';
    case 'SUB_ADMIN':
      return 'sub-admin';
    case 'AGENT':
      return 'agent';
    case 'CUSTOMER':
      return 'customer';
    case 'SUPER_ADMIN':
      return 'super-admin';
    default:
      // Convert 'MY_ROLE' to 'my-role'
      return normalizedRole.toLowerCase().replace(/_/g, '-');
  }
};

/**
 * Checks if a role is considered administrative.
 * 
 * @param role The role name
 * @returns True if the role has administrative access
 */
export const isAdminRole = (role: string | null | undefined): boolean => {
  if (!role) return false;
  const normalizedRole = role.toUpperCase();
  return ['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'].includes(normalizedRole);
};
