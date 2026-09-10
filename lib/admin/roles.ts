/**
 * Enterprise Role Hierarchy - Shared metadata
 */
export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'];
export const MANAGEMENT_ROLES = [...ADMIN_ROLES];
export const FACULTY_ROLES = ['TEACHER', 'INSTRUCTOR'];
export const STAFF_ROLES = [...MANAGEMENT_ROLES, ...FACULTY_ROLES, 'BLOG_WRITER', 'SUPPORT_LEAD'];
