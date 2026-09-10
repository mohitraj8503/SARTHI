export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER_PENDING: 'TEACHER_PENDING', // Registered but not approved
  INSTRUCTOR: 'INSTRUCTOR',           // Approved teacher
  MODERATOR: 'MODERATOR',             // Content & Community review
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',         // Infrastructure control (legacy GOD_ADMIN)
  BLOG_WRITER: 'BLOG_WRITER',
  // Legacy mappings for compatibility
  TEACHER: 'INSTRUCTOR', 
  GOD_ADMIN: 'SUPER_ADMIN',
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: [
    'manage_everything',
    'manage_admins',
    'infrastructure_control',
    'view_all_audit_logs',
    'force_delete',
  ],
  [ROLES.ADMIN]: [
    'manage_users',
    'approve_teachers',
    'manage_courses',
    'view_analytics',
    'suspend_users',
    'manage_finance',
    'view_teacher_docs',
  ],
  [ROLES.MODERATOR]: [
    'review_content',
    'moderate_chat',
    'flag_abuse',
    'view_basic_analytics',
  ],
  [ROLES.INSTRUCTOR]: [
    'create_course',
    'manage_own_students',
    'start_live_class',
    'view_own_earnings',
    'upload_assets',
  ],
  [ROLES.TEACHER_PENDING]: [
    'view_onboarding_status',
    'upload_application_docs',
    'edit_application',
  ],
  [ROLES.BLOG_WRITER]: [
    'create_blog_post',
    'edit_own_blog',
    'submit_blog_for_review',
  ],
};

export const HIERARCHY: Record<string, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 80,
  [ROLES.MODERATOR]: 60,
  [ROLES.INSTRUCTOR]: 40,
  [ROLES.TEACHER_PENDING]: 20,
  [ROLES.BLOG_WRITER]: 10,
  [ROLES.STUDENT]: 1,
};

export const hasPermission = (userRole: string, permission: string) => {
  if (userRole === ROLES.SUPER_ADMIN) return true;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

export const canManageRole = (myRole: string, targetRole: string) => {
  return (HIERARCHY[myRole] || 0) > (HIERARCHY[targetRole] || 0);
};
