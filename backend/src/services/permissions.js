export const rolePermissions = {
  admin: { modules: ['*'], actions: ['*'] },
  vendedor: {
    modules: ['inicio', 'ingresos', 'informes'],
    actions: ['facturas:create', 'facturas:read', 'informes:read']
  },
  tesoreria: {
    modules: ['inicio', 'egresos', 'tesoreria', 'informes'],
    actions: ['egresos:create', 'egresos:read', 'informes:read']
  },
  contador: {
    modules: ['inicio', 'base_datos', 'informes'],
    actions: ['informes:read', 'facturas:read', 'entidades:read']
  }
};

export function can(role, action) {
  const p = rolePermissions[role] || { actions: [] };
  return p.actions.includes('*') || p.actions.includes(action);
}
