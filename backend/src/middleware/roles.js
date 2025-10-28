export const ROLES = {
  ADMIN: 1,
  COORD: 2,
  DOC_TC: 3,
  DOC_GNR: 4,
  EST: 5
};
export const allowRoles = (...roleIds) => (req, _res, next) => {
  if (!req.user) return _res.status(401).json({ message: 'Unauthenticated' });
  if (!roleIds.includes(req.user.role_id)) {
    return _res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
