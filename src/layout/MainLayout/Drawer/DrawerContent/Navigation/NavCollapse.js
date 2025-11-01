import PropTypes from "prop-types";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// material-ui
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Collapse,
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

// project-imports
import NavItem from "./NavItem";
import Dot from "components/@extended/Dot";
import SimpleBar from "components/third-party/SimpleBar";
import Transitions from "components/@extended/Transitions";

import useConfig from "hooks/useConfig";
// import { dispatch, useSelector } from 'store';
// import { activeItem } from 'store/reducers/menu';
// import { MenuOrientation, ThemeMode } from 'config';

// assets
import { ArrowDown2, ArrowRight2, Copy } from "iconsax-react";
import { useDispatch, useSelector } from "react-redux";
import { activeItem } from "features/Menu/menuSlice";
import { MenuOrientation, ThemeMode } from "configAble";

// mini-menu - wrapper with GLASSMORPHISM effect
const PopperStyled = styled(Popper)(({ theme }) => ({
  overflow: "visible",
  zIndex: 1202,
  minWidth: 200,
  "&:before": {
    content: '""',
    display: "block",
    position: "absolute",
    top: 38,
    left: -5,
    width: 10,
    height: 10,
    backgroundColor: theme.palette.background.paper,
    transform: "translateY(-50%) rotate(45deg)",
    zIndex: 120,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backdropFilter: "blur(20px)",
  },
  "& .MuiPaper-root": {
    // ✨ GLASSMORPHISM EFFECT
    backdropFilter: "blur(20px) saturate(180%)",
    background:
      theme.palette.mode === ThemeMode.DARK
        ? "rgba(30, 30, 30, 0.85)"
        : "rgba(255, 255, 255, 0.85)",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    boxShadow:
      theme.palette.mode === ThemeMode.DARK
        ? "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset"
        : "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8) inset",
    overflow: "hidden",
  },
}));

// ✨ ICON ANIMATIONS KEYFRAMES
const iconAnimations = {
  "@keyframes iconBounce": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-4px)" },
  },
  "@keyframes iconPulse": {
    "0%, 100%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
  },
};

// ==============================|| NAVIGATION - COLLAPSE ||============================== //

const NavCollapse = ({
  menu,
  level,
  parentId,
  setSelectedItems,
  selectedItems,
  setSelectedLevel,
  selectedLevel,
}) => {
  const theme = useTheme();
  const navigation = useNavigate();

  const downLG = useMediaQuery(theme.breakpoints.down("lg"));
  const { drawerOpen } = useSelector((state) => state.menu);
  const { menuOrientation } = useConfig();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(null);
    setSelectedLevel(level);
    if (drawerOpen) {
      setOpen(!open);
      setSelected(!selected ? menu.id : null);
      setSelectedItems(!selected ? menu.id : "");
      if (menu.url) navigation(`${menu.url}`);
    } else {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handlerIconLink = () => {
    if (!drawerOpen) {
      if (menu.url) navigation(`${menu.url}`);
      setSelected(menu.id);
    }
  };

  const handleHover = (event) => {
    setAnchorEl(event?.currentTarget);
    if (!drawerOpen) {
      setSelected(menu.id);
    }
  };

  const miniMenuOpened = Boolean(anchorEl);

  const handleClose = () => {
    setOpen(false);
    if (!miniMenuOpened && !menu.url) {
      setSelected(null);
    }
    setAnchorEl(null);
  };

  useMemo(() => {
    if (selected === selectedItems) {
      if (level === 1) {
        setOpen(true);
      }
    } else {
      if (level === selectedLevel) {
        setOpen(false);
        if ((!miniMenuOpened && !drawerOpen && !selected) || drawerOpen) {
          setSelected(null);
        }
      }
    }
  }, [
    selectedItems,
    level,
    selected,
    miniMenuOpened,
    drawerOpen,
    selectedLevel,
  ]);

  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === menu.url) {
      setSelected(menu.id);
    }
    // eslint-disable-next-line
  }, [pathname]);

  const checkOpenForParent = (child, id) => {
    child.forEach((item) => {
      if (item.url === pathname) {
        setOpen(true);
        setSelected(id);
      }
    });
  };

  // menu collapse for sub-levels
  useEffect(() => {
    setOpen(false);
    if (!miniMenuOpened) {
      setSelected(null);
    }
    if (miniMenuOpened) setAnchorEl(null);
    if (menu.children) {
      menu.children.forEach((item) => {
        if (item.children?.length) {
          checkOpenForParent(item.children, menu.id);
        }
        if (pathname && pathname.includes("product-details")) {
          if (item.url && item.url.includes("product-details")) {
            setSelected(menu.id);
            setOpen(true);
          }
        }
        if (item.url === pathname) {
          setSelected(menu.id);
          setOpen(true);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menu.children]);
  const dispatch = useDispatch();
  useEffect(() => {
    if (menu.url === pathname) {
      dispatch(activeItem({ openItem: [menu.id] }));
      setSelected(menu.id);
      setAnchorEl(null);
      setOpen(true);
    }
  }, [pathname, menu, dispatch]);

  const navCollapse = menu.children?.map((item) => {
    switch (item.type) {
      case "collapse":
        return (
          <NavCollapse
            key={item.id}
            setSelectedItems={setSelectedItems}
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            selectedItems={selectedItems}
            menu={item}
            level={level + 1}
            parentId={parentId}
          />
        );
      case "item":
        return <NavItem key={item.id} item={item} level={level + 1} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Collapse or Item
          </Typography>
        );
    }
  });

  const isSelected = selected === menu.id;
  const borderIcon =
    level === 1 ? <Copy variant="Bulk" size={drawerOpen ? 22 : 24} /> : false;
  const Icon = menu.icon;
  const menuIcon = menu.icon ? (
    <Icon variant="Bulk" size={drawerOpen ? 22 : 24} />
  ) : (
    borderIcon
  );
  const textColor =
    theme.palette.mode === ThemeMode.DARK
      ? theme.palette.secondary[400]
      : theme.palette.secondary.main;
  const iconSelectedColor =
    theme.palette.mode === ThemeMode.DARK && drawerOpen
      ? theme.palette.text.primary
      : theme.palette.primary.main;
  const popperId = miniMenuOpened ? `collapse-pop-${menu.id}` : undefined;
  const FlexBox = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  };

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <>
          <ListItemButton
            selected={isSelected}
            {...(!drawerOpen && {
              onMouseEnter: handleClick,
              onMouseLeave: handleClose,
            })}
            onClick={handleClick}
            sx={{
              pl: drawerOpen ? `${level === 1 ? 20 : level * 20 - 10}px` : 1.5,
              py: !drawerOpen && level === 1 ? 1.25 : 1,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Consistent 300ms
              position: "relative",
              ...(drawerOpen && {
                mx: 1.25,
                my: 0.5,
                borderRadius: 1,
                overflow: "hidden", // For shimmer effect
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === ThemeMode.DARK
                      ? "divider"
                      : "secondary.200",
                  transform: "translateX(4px)",
                  boxShadow:
                    theme.palette.mode === ThemeMode.DARK
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "0 2px 8px rgba(0,0,0,0.1)",
                },
                "&.Mui-selected": {
                  color: iconSelectedColor,
                  // ✨ GRADIENT BACKGROUND
                  background:
                    theme.palette.mode === ThemeMode.DARK
                      ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.primary.light} 100%)`,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    borderRadius: "0 4px 4px 0",
                    boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
                  },
                },
              }),
              ...(!drawerOpen && {
                mx: 0.5, // Thêm margin khi mini
                my: 0.5,
                borderRadius: 1,
                justifyContent: "center",
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === ThemeMode.DARK
                      ? "secondary.dark"
                      : "secondary.lighter",
                  transform: "scale(1.08)",
                },
                "&.Mui-selected": {
                  bgcolor:
                    theme.palette.mode === ThemeMode.DARK
                      ? "primary.dark"
                      : "primary.lighter",
                  "&:hover": {
                    bgcolor:
                      theme.palette.mode === ThemeMode.DARK
                        ? "primary.main"
                        : "primary.light",
                    transform: "scale(1.08)",
                  },
                },
              }),
            }}
          >
            {menuIcon && (
              <ListItemIcon
                onClick={handlerIconLink}
                sx={{
                  minWidth: 38,
                  color: isSelected ? "primary.main" : textColor,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  // ✨ ADD KEYFRAMES
                  ...iconAnimations,
                  // ✨ ICON ANIMATION ON HOVER
                  "& svg": {
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  },
                  "&:hover svg": {
                    animation: "iconBounce 0.6s ease-in-out",
                  },
                  ...(!drawerOpen && {
                    borderRadius: 1,
                    width: 48,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === ThemeMode.DARK
                          ? "secondary.dark"
                          : "secondary.200",
                      transform: "scale(1.1)",
                    },
                    "&:hover svg": {
                      animation: "iconBounce 0.6s ease-in-out",
                    },
                  }),
                  ...(!drawerOpen &&
                    isSelected && {
                      bgcolor:
                        theme.palette.mode === ThemeMode.DARK
                          ? "primary.dark"
                          : "primary.lighter",
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === ThemeMode.DARK
                            ? "primary.main"
                            : "primary.light",
                        transform: "scale(1.1)",
                      },
                    }),
                  ...(drawerOpen &&
                    isSelected && {
                      color: "primary.main",
                      "& svg": {
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                      },
                    }),
                }}
              >
                {menuIcon}
              </ListItemIcon>
            )}

            {!menuIcon && drawerOpen && (
              <ListItemIcon
                sx={{
                  minWidth: 30,
                }}
              >
                <Dot
                  size={isSelected ? 6 : 5}
                  color={isSelected ? "primary" : "secondary"}
                />
              </ListItemIcon>
            )}

            {(drawerOpen || (!drawerOpen && level !== 1)) && (
              <ListItemText
                primary={
                  <Typography
                    variant="h6"
                    color={isSelected ? "primary" : textColor}
                    sx={{ fontWeight: isSelected ? 500 : 400 }}
                  >
                    {menu.title}
                  </Typography>
                }
                secondary={
                  menu.caption && (
                    <Typography variant="caption" color="secondary">
                      {menu.caption}
                    </Typography>
                  )
                }
              />
            )}
            {(drawerOpen || (!drawerOpen && level !== 1)) && (
              <Box
                sx={{
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    miniMenuOpened || open ? "rotate(180deg)" : "rotate(0deg)",
                  display: "flex",
                  alignItems: "center",
                  ml: 1,
                }}
              >
                {miniMenuOpened ? (
                  <ArrowRight2 size={12} color={textColor} />
                ) : (
                  <ArrowDown2 size={12} color={textColor} />
                )}
              </Box>
            )}

            {!drawerOpen && (
              <PopperStyled
                open={miniMenuOpened}
                anchorEl={anchorEl}
                placement="right-start"
                style={{
                  zIndex: 2001,
                }}
                popperOptions={{
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [-12, 1],
                      },
                    },
                  ],
                }}
              >
                {({ TransitionProps }) => (
                  <Transitions in={miniMenuOpened} {...TransitionProps}>
                    <Paper
                      sx={{
                        overflow: "hidden",
                        mt: 1.5,
                        boxShadow: theme.customShadows.z1,
                        backgroundImage: "none",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <>
                          <SimpleBar
                            sx={{
                              overflowX: "hidden",
                              overflowY: "auto",
                              maxHeight: "calc(100vh - 170px)",
                            }}
                          >
                            {navCollapse}
                          </SimpleBar>
                        </>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </PopperStyled>
            )}
          </ListItemButton>
          {drawerOpen && (
            <Collapse
              in={open}
              timeout={{
                enter: 300,
                exit: 300,
              }}
              easing={{
                enter: "cubic-bezier(0.4, 0, 0.2, 1)",
                exit: "cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              unmountOnExit
              sx={{
                "& .MuiCollapse-wrapper": {
                  "& .MuiCollapse-wrapperInner": {
                    overflow: "visible",
                  },
                },
              }}
            >
              <List
                sx={{
                  p: 0,
                  "& .MuiListItemButton-root": {
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateX(8px)",
                    },
                  },
                }}
              >
                {navCollapse}
              </List>
            </Collapse>
          )}
        </>
      ) : (
        <>
          <ListItemButton
            id={`boundary-${popperId}`}
            selected={isSelected}
            onMouseEnter={handleHover}
            onMouseLeave={handleClose}
            onClick={handleHover}
            aria-describedby={popperId}
            sx={{
              "&:hover": {
                bgcolor: "transparent",
              },
              "&.Mui-selected": {
                "&:hover": {
                  bgcolor: "transparent",
                },
                bgcolor: "transparent",
              },
            }}
          >
            <Box onClick={handlerIconLink} sx={FlexBox}>
              {menuIcon && (
                <ListItemIcon
                  sx={{
                    my: "auto",
                    minWidth: !menu.icon ? 18 : 36,
                    color: theme.palette.secondary.dark,
                  }}
                >
                  {menuIcon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={
                  <Typography
                    variant="h6"
                    color={textColor}
                    sx={{ fontWeight: isSelected ? 500 : 400 }}
                  >
                    {menu.title}
                  </Typography>
                }
              />
              {miniMenuOpened ? (
                <ArrowRight2 size={12} color={textColor} />
              ) : (
                <ArrowDown2 size={12} color={textColor} />
              )}
            </Box>

            {anchorEl && (
              <PopperStyled
                id={popperId}
                open={miniMenuOpened}
                anchorEl={anchorEl}
                placement="right-start"
                style={{
                  zIndex: 2001,
                }}
                modifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [-10, 0],
                    },
                  },
                ]}
              >
                {({ TransitionProps }) => (
                  <Transitions in={miniMenuOpened} {...TransitionProps}>
                    <Paper
                      sx={{
                        overflow: "hidden",
                        mt: 1.5,
                        py: 0.5,
                        boxShadow: theme.customShadows.z1,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundImage: "none",
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <>
                          <SimpleBar
                            sx={{
                              overflowX: "hidden",
                              overflowY: "auto",
                              maxHeight: "calc(100vh - 170px)",
                            }}
                          >
                            {navCollapse}
                          </SimpleBar>
                        </>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </PopperStyled>
            )}
          </ListItemButton>
        </>
      )}
    </>
  );
};

NavCollapse.propTypes = {
  menu: PropTypes.object,
  level: PropTypes.number,
  parentId: PropTypes.string,
  setSelectedItems: PropTypes.func,
  selectedItems: PropTypes.string,
  setSelectedLevel: PropTypes.func,
  selectedLevel: PropTypes.number,
};

export default NavCollapse;
