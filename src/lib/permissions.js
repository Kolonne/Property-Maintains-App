export const permissions = {
  tenant: {
    tenant_dashboard: ["view"],
    maintenance: ["view", "create"],
  },

  landlord: {
    landlord_dashboard: ["view"],
    approvals: ["view", "update"],
  },

  pm: {
    pm_dashboard: ["view"],
    maintenance: ["view", "update", "delete"],
    allRequests: ["view", "update", "delete"],
  },
};

export function hasPermission(role, screen, action) {
  const rolePermissions = permissions[role];

  if (!rolePermissions) return false;

  const screenPermissions = rolePermissions[screen];

  if (!screenPermissions) return false;

  return screenPermissions.includes(action);
}