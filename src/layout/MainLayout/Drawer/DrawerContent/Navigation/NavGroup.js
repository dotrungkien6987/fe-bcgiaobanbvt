import PropTypes from "prop-types";
import { useEffect, useState, Fragment } from "react";
import { useLocation } from "react-router";

// material-ui
import { useTheme, styled } from "@mui/material/styles";
import {
  Box,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useMediaQuery,
} from "@mui/material";

// third-party

// project-imports
import NavItem from "./NavItem";
import NavCollapse from "./NavCollapse";
import SimpleBar from "components/third-party/SimpleBar";
import Transitions from "components/@extended/Transitions";

import useConfig from "hooks/useConfig";
import { useDispatch, useSelector } from "react-redux";

import { MenuOrientation, ThemeMode } from "configAble";

// assets
import { More2 } from "iconsax-react";
import { activeID } from "features/Menu/menuSlice";

// ==============================|| NAVIGATION - GROUP ||============================== //

const PopperStyled = styled(Popper)(({ theme }) => ({
  overflow: "visible",
  zIndex: 1202,
  minWidth: 180,
  "&:before": {
    background: theme.palette.background.paper,
    content: '""',
    display: "block",
    position: "absolute",
    top: 5,
    left: 32,
    width: 12,
    height: 12,
    transform: "translateY(-50%) rotate(45deg)",
    zIndex: 120,
    borderWidth: "6px",
    borderStyle: "solid",
    borderColor: `${theme.palette.background.paper}  transparent transparent ${theme.palette.background.paper}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.mode === ThemeMode.DARK
        ? "-2px -2px 5px rgba(0,0,0,0.2)"
        : "-2px -2px 5px rgba(0,0,0,0.1)",
  },
  "& .MuiPaper-root": {
    backdropFilter: "blur(8px)",
    background:
      theme.palette.mode === ThemeMode.DARK
        ? "rgba(30, 30, 30, 0.95)"
        : "rgba(255, 255, 255, 0.95)",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    boxShadow:
      theme.palette.mode === ThemeMode.DARK
        ? "0 8px 32px rgba(0,0,0,0.5)"
        : "0 8px 32px rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
}));

const NavGroup = ({
  item,
  lastItem,
  remItems,
  lastItemId,
  setSelectedItems,
  selectedItems,
  setSelectedLevel,
  selectedLevel,
}) => {
  const theme = useTheme();
  const { pathname } = useLocation();

  const { menuOrientation, menuCaption } = useConfig();
  const { drawerOpen, selectedID } = useSelector((state) => state.menu);

  const downLG = useMediaQuery(theme.breakpoints.down("lg"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentItem, setCurrentItem] = useState(item);

  const openMini = Boolean(anchorEl);

  useEffect(() => {
    if (lastItem) {
      if (item.id === lastItemId) {
        const localItem = { ...item };
        const elements = remItems.map((ele) => ele.elements);
        localItem.children = elements.flat(1);
        setCurrentItem(localItem);
      } else {
        setCurrentItem(item);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, lastItem, downLG]);

  const dispatch = useDispatch();
  const checkOpenForParent = (child, id) => {
    child.forEach((ele) => {
      if (ele.children?.length) {
        checkOpenForParent(ele.children, currentItem.id);
      }
      if (ele.url === pathname) {
        dispatch(activeID(id));
      }
    });
  };
  const checkSelectedOnload = (data) => {
    const childrens = data.children ? data.children : [];
    childrens.forEach((itemCheck) => {
      if (itemCheck.children?.length) {
        checkOpenForParent(itemCheck.children, currentItem.id);
      }
      if (itemCheck.url === pathname) {
        dispatch(activeID(currentItem.id));
      }
    });
  };

  useEffect(() => {
    checkSelectedOnload(currentItem);
    if (openMini) setAnchorEl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentItem]);

  const handleClick = (event) => {
    if (!openMini) {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isSelected = selectedID === currentItem.id;

  const Icon = currentItem?.icon;
  const itemIcon = currentItem?.icon ? (
    <Icon
      variant="Bulk"
      size={24}
      color={
        isSelected ? theme.palette.primary.main : theme.palette.secondary.main
      }
    />
  ) : null;

  const navCollapse = item.children?.map((menuItem) => {
    switch (menuItem.type) {
      case "collapse":
        return (
          <NavCollapse
            key={menuItem.id}
            menu={menuItem}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            level={1}
            parentId={currentItem.id}
          />
        );
      case "item":
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography
            key={menuItem.id}
            variant="h6"
            color="error"
            align="center"
          >
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  const moreItems = remItems.map((itemRem, i) => (
    <Fragment key={i}>
      {itemRem.title && (
        <Typography variant="caption" sx={{ pl: 2 }}>
          {itemRem.title}
        </Typography>
      )}
      {itemRem?.elements?.map((menu) => {
        switch (menu.type) {
          case "collapse":
            return (
              <NavCollapse
                key={menu.id}
                menu={menu}
                level={1}
                parentId={currentItem.id}
                setSelectedItems={setSelectedItems}
                setSelectedLevel={setSelectedLevel}
                selectedLevel={selectedLevel}
                selectedItems={selectedItems}
              />
            );
          case "item":
            return <NavItem key={menu.id} item={menu} level={1} />;
          default:
            return (
              <Typography
                key={menu.id}
                variant="h6"
                color="error"
                align="center"
              >
                Menu Items Error
              </Typography>
            );
        }
      })}
    </Fragment>
  ));

  // menu list collapse & items
  const items = currentItem.children?.map((menu) => {
    switch (menu.type) {
      case "collapse":
        return (
          <NavCollapse
            key={menu.id}
            menu={menu}
            level={1}
            parentId={currentItem.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
          />
        );
      case "item":
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  const popperId = openMini ? `group-pop-${item.id}` : undefined;
  const textColor =
    theme.palette.mode === ThemeMode.DARK ? "secondary.400" : "secondary.main";

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <List
          subheader={
            item.title &&
            drawerOpen &&
            menuCaption && (
              <Box sx={{ pl: 3, mb: 1.5, position: "relative" }}>
                <Typography
                  variant="h5"
                  color={
                    theme.palette.mode === ThemeMode.DARK
                      ? "textSecondary"
                      : "secondary.dark"
                  }
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.688rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      width: 24,
                      height: 2,
                      bgcolor: "primary.main",
                      borderRadius: 1,
                      opacity: 0.6,
                    },
                  }}
                >
                  {item.title}
                </Typography>
                {item.caption && (
                  <Typography
                    variant="caption"
                    color="secondary"
                    sx={{
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                      opacity: 0.8,
                      mt: 0.5,
                      display: "block",
                    }}
                  >
                    {item.caption}
                  </Typography>
                )}
              </Box>
            )
          }
          sx={{
            mt: drawerOpen && menuCaption && item.title ? 1.5 : 0,
            py: 0,
            zIndex: 0,
          }}
        >
          {navCollapse}
        </List>
      ) : (
        <List>
          <ListItemButton
            selected={isSelected}
            sx={{
              p: 1,
              px: 1.5,
              my: 0.5,
              mr: 1,
              display: "flex",
              alignItems: "center",
              borderRadius: 1,
            }}
            onMouseEnter={handleClick}
            onClick={handleClick}
            onMouseLeave={handleClose}
            aria-describedby={popperId}
          >
            {itemIcon && (
              <ListItemIcon sx={{ minWidth: 32 }}>
                {currentItem.id === lastItemId ? (
                  <More2 size={22} variant="Bulk" />
                ) : (
                  itemIcon
                )}
              </ListItemIcon>
            )}
            <ListItemText
              sx={{ mr: 1 }}
              primary={
                <Typography
                  variant="h6"
                  color={isSelected ? "primary" : textColor}
                  sx={{ fontWeight: isSelected ? 500 : 400 }}
                >
                  {currentItem.id === lastItemId
                    ? "FormattedMessage"
                    : currentItem.title}
                </Typography>
              }
            />
            {anchorEl && (
              <PopperStyled
                id={popperId}
                open={openMini}
                anchorEl={anchorEl}
                placement="bottom-start"
                style={{
                  zIndex: 2001,
                }}
              >
                {({ TransitionProps }) => (
                  <Transitions in={openMini} {...TransitionProps}>
                    <Paper
                      sx={{
                        mt: 0.5,
                        py: 1.25,
                        boxShadow: theme.customShadows.z1,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundImage: "none",
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <>
                          <SimpleBar
                            sx={{
                              minWidth: 200,
                              overflowY: "auto",
                              maxHeight: "calc(100vh - 170px)",
                            }}
                          >
                            {currentItem.id !== lastItemId ? items : moreItems}
                          </SimpleBar>
                        </>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </PopperStyled>
            )}
          </ListItemButton>
        </List>
      )}
    </>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object,
  lastItem: PropTypes.number,
  remItems: PropTypes.array,
  lastItemId: PropTypes.string,
  setSelectedItems: PropTypes.func,
  selectedItems: PropTypes.string,
  setSelectedLevel: PropTypes.func,
  selectedLevel: PropTypes.number,
};

export default NavGroup;
