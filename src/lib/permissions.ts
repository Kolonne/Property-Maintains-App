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
    properties: ['view'],
    condition_reports: ['view', 'create'],
  },

  landlord: {
    dashboard: ['view'],
    maintenance: ['view'],
    maintenance_detail: ['view'],
    properties: ['view'],
    condition_reports: ['view'],
    approvals: ['view', 'approve'],
  },

  property_manager: {
    dashboard: ['view'],
    maintenance: ['view', 'create', 'update', 'delete'],
    maintenance_detail: ['view', 'update', 'delete'],
    properties: ['view', 'create', 'update'],
    condition_reports: ['view', 'create', 'update'],
    users: ['view', 'create', 'update'],
    approvals: ['view', 'update', 'approve'],
  },

  null: {
    dashboard: [],
    maintenance: [],
    maintenance_detail: [],
    properties: [],
    condition_reports: [],
    users: [],
    approvals: [],
  },
};

export function hasPermission(role: UserRole, screen: string, action: Action): boolean {
  return permissions[role]?.[screen]?.includes(action) ?? false;
}
