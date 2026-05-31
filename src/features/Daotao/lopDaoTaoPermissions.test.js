import {
  canManageLopDaoTao,
  getLopDaoTaoOwnerId,
  isLopDaoTaoManageRole,
} from "./lopDaoTaoPermissions";

describe("lopDaoTaoPermissions", () => {
  test("admin can manage any lop dao tao", () => {
    expect(
      canManageLopDaoTao(
        { _id: "admin-1", PhanQuyen: "admin" },
        { UserIDCreated: "creator-1" },
      ),
    ).toBe(true);
  });

  test("creator can manage own lop dao tao", () => {
    expect(
      canManageLopDaoTao(
        { _id: "creator-1", PhanQuyen: "manager" },
        { UserIDCreated: { _id: "creator-1", UserName: "creator" } },
      ),
    ).toBe(true);
  });

  test("non-owner non-admin cannot manage lop dao tao", () => {
    expect(
      canManageLopDaoTao(
        { _id: "viewer-1", PhanQuyen: "manager" },
        { UserIDCreated: "creator-1" },
      ),
    ).toBe(false);
  });

  test("owner id extractor supports string and object refs", () => {
    expect(getLopDaoTaoOwnerId({ UserIDCreated: "creator-1" })).toBe(
      "creator-1",
    );
    expect(getLopDaoTaoOwnerId({ UserIDCreated: { _id: "creator-2" } })).toBe(
      "creator-2",
    );
  });

  test("only admin roles are privileged managers", () => {
    expect(isLopDaoTaoManageRole({ PhanQuyen: "admin" })).toBe(true);
    expect(isLopDaoTaoManageRole({ PhanQuyen: "superadmin" })).toBe(true);
    expect(isLopDaoTaoManageRole({ PhanQuyen: "daotao" })).toBe(false);
  });
});
