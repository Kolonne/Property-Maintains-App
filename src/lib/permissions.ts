type Action = 'view' | 'create' | 'update' | 'delete' | 'approve';

type PermissionMap = {
  [role in UserRole]: {
    [screen: string]: Action[];
  };
};

type UserRole = 'tenant' | 'landlord' | 'property_manager' | 'null';

export const permissions: PermissionMap = {
  tenant: {
    dashboard: ['view'],
    maintenance: ['view', 'create'],
    maintenance_detail: ['view', 'update'],
    condition_reports: ['view', 'create'],
    profile: ['view'],
  },

  landlord: {
    dashboard: ['view'],
    maintenance: ['view', 'create'],
    maintenance_detail: ['view'],
    properties: ['view'],
    quotes: ['view'],
    condition_reports: ['view'],
    approvals: ['view', 'approve'],
    profile: ['view'],
  },

  property_manager: {
    dashboard: ['view'],
    maintenance: ['view', 'create', 'update', 'delete'],
    maintenance_detail: ['view', 'update', 'delete'],
    properties: ['view', 'create', 'update'],
    quotes: ['view', 'create', 'update'],
    condition_reports: ['view', 'create', 'update'],
    users: ['view', 'create', 'update'],
    approvals: ['view', 'update', 'approve'],
    profile: ['view'],
  },

  null: {
    dashboard: [],
    maintenance: [],
    maintenance_detail: [],
    properties: [],
    quotes: [],
    condition_reports: [],
    users: [],
    approvals: [],
  },
};

export function hasPermission(role: UserRole, screen: string, action: Action): boolean {
  return permissions[role]?.[screen]?.includes(action) ?? false;
}
