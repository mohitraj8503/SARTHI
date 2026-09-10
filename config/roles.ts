/**
 * Admin Panel Role Configurations
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER', // Extra roles if needed
  INSTRUCTOR: 'INSTRUCTOR', 
  PODCAST_HOST: 'PODCAST_HOST',
  GOD_ADMIN: 'GOD_ADMIN', // Super admin
} as const;

export type UserRole = keyof typeof ROLES;

/**
 * Helper to check if a role is administrative
 */
export function isAdministrativeRole(role: string): boolean {
  const adminRoles = [ROLES.ADMIN, ROLES.GOD_ADMIN];
  return adminRoles.includes(role as any);
}
