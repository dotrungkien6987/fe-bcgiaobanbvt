import { useEffect, useLayoutEffect, useState } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Box, Typography, useMediaQuery } from "@mui/material";

// project-imports
import NavGroup from "./NavGroup";
import menuItem from "menu-items";
import { Menu } from "menu-items/dashboard";

import { useSelector } from "react-redux";
import useConfig from "hooks/useConfig";
import { HORIZONTAL_MAX_ITEM } from "configAble";
import { MenuOrientation } from "configAble";
import useAuth from "hooks/useAuth";

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const { user } = useAuth();

  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down("lg"));
  const { menuOrientation } = useConfig();
  const { drawerOpen } = useSelector((state) => state.menu);

  const [selectedItems, setSelectedItems] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [menuItems, setMenuItems] = useState({ items: [] });

  // Kiểm tra xem user có quyền truy cập menu item hay không
  const hasAccess = (item) => {
    if (!user || !user.PhanQuyen) return false;
    const role = user.PhanQuyen || "default";
    return item.roles?.includes(role);
  };

  useEffect(() => {
    handlerMenuItem();
    // eslint-disable-next-line
  }, [user]);

  // Đệ quy thay placeholder :NhanVienID bằng giá trị thực tế
  const replaceNhanVienID = (node) => {
    if (!node) return null;
    // Ẩn node yêu cầu NhanVienID nếu chưa có user
    if (node.url && node.url.includes(":NhanVienID") && !user?.NhanVienID) {
      return null;
    }
    const newNode = { ...node };
    if (
      newNode.url &&
      user?.NhanVienID &&
      newNode.url.includes(":NhanVienID")
    ) {
      newNode.url = newNode.url.replace(":NhanVienID", user.NhanVienID);
    }
    if (Array.isArray(newNode.children)) {
      newNode.children = newNode.children
        .map(replaceNhanVienID)
        .filter(Boolean);
    }
    return newNode;
  };

  useLayoutEffect(() => {
    // Clone & xử lý placeholder động
    const processed = {
      ...menuItem,
      items: menuItem.items.map(replaceNhanVienID),
    };
    setMenuItems(processed);
    // eslint-disable-next-line
  }, [menuItem, user?.NhanVienID]);

  let getMenu = Menu();
  // Nếu getMenu có roles, đảm bảo gán nó
  if (getMenu && !getMenu.roles) {
    getMenu.roles = ["noibo", "admin", "daotao", "manager", "nomal"]; // Dashboard hiện cho tất cả
  }

  const handlerMenuItem = () => {
    // Kiểm tra xem Dashboard đã được thêm vào chưa
    const isFound = menuItems.items.some(
      (element) => element.id === "group-dashboard"
    );

    if (getMenu?.id !== undefined && !isFound) {
      // Thêm Dashboard menu vào đầu danh sách nếu chưa có
      const updatedItems = { ...menuItems };
      updatedItems.items = [getMenu, ...updatedItems.items];
      setMenuItems(updatedItems);
    }
  };

  const isHorizontal =
    menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;

  // Lọc menu items dựa trên phân quyền trước khi xử lý
  const visibleItems = menuItems.items.filter((item) => hasAccess(item));

  let lastItemIndex = visibleItems.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < visibleItems.length) {
    lastItemId = visibleItems[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = visibleItems
      .slice(lastItem - 1, visibleItems.length)
      .map((item) => ({
        title: item.title,
        elements: item.children,
        icon: item.icon,
      }));
  }

  const navGroups = visibleItems.slice(0, lastItemIndex + 1).map((item) => {
    switch (item.type) {
      case "group":
        return (
          <NavGroup
            key={item.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box
      sx={{
        pt: drawerOpen ? (isHorizontal ? 0 : 1.5) : 0,
        pb: 1,
        "& > ul:first-of-type": { mt: 0 },
        display: isHorizontal ? { xs: "block", lg: "flex" } : "block",
        flex: 1,
        minHeight: 0,
      }}
    >
      {navGroups}
    </Box>
  );
};

export default Navigation;
