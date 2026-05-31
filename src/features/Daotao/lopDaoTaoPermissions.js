const LOP_DAO_TAO_MANAGE_ROLES = ["admin", "superadmin"];

const normalizeRole = (role) => (role || "").toLowerCase();

export const isLopDaoTaoManageRole = (user) =>
  LOP_DAO_TAO_MANAGE_ROLES.includes(normalizeRole(user?.PhanQuyen));

export const getLopDaoTaoOwnerId = (lopdaotao) => {
  const owner = lopdaotao?.UserIDCreated;
  if (!owner) return "";
  if (typeof owner === "string") return owner;
  return owner?._id || "";
};

export const canManageLopDaoTao = (user, lopdaotao) => {
  if (!user) return false;
  if (isLopDaoTaoManageRole(user)) return true;

  const ownerId = getLopDaoTaoOwnerId(lopdaotao);
  return Boolean(ownerId && user._id === ownerId);
};
