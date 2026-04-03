// src/utils/tenantUtils.ts

/**
 * Extracts the tenant ID from the window's hostname.
 * Assumes the tenant ID is the first part of the hostname (e.g., 'tenant1.vuradesk.com').
 * Returns a default for development environments if no subdomain is found.
 * @returns {string} The tenant ID.
 */
export const getTenantId = (): string => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // If the hostname is 'localhost' or doesn't have a subdomain part
  if (parts.length < 3 || hostname.startsWith('localhost')) {
    // For local development, use a consistent test tenant ID.
    // The user should ensure this tenant exists in their database.
    return 'vura-test';
  }

  // For production, use the subdomain
  return parts[0];
};
