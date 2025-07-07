import PropTypes from "prop-types";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Avatar,
  Chip,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  Tooltip,
  Zoom,
} from "@mui/material";

// project-imports
import Dot from "components/@extended/Dot";
import useConfig from "hooks/useConfig";

import { MenuOrientation, ThemeMode } from "configAble";
import { useDispatch, useSelector } from "react-redux";
import { activeID, activeItem, openDrawer } from "features/Menu/menuSlice";

// ==============================|| NAVIGATION - ITEM ||============================== //

const NavItem = ({ item, level }) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down("lg"));

  const { drawerOpen, openItem } = useSelector((state) => state.menu);
  const { menuOrientation } = useConfig();

  let itemTarget = "_self";
  if (item.target) {
    itemTarget = "_blank";
  }

  const isSelected = openItem.findIndex((id) => id === item.id) > -1;

  const Icon = item.icon;
  const itemIcon = item.icon ? (
    <Icon variant="Bulk" size={drawerOpen ? 20 : 24} />
  ) : (
    false
  );

  const { pathname } = useLocation();
  const dispatch = useDispatch();
  // active menu item on page load
  useEffect(() => {
    if (pathname && pathname.includes("product-details")) {
      if (item.url && item.url.includes("product-details")) {
        dispatch(activeID({ openItem: [item.id] }));
      }
    }

    if (pathname && pathname.includes("kanban")) {
      if (item.url && item.url.includes("kanban")) {
        dispatch(activeID({ openItem: [item.id] }));
      }
    }

    if (pathname === item.url) {
      dispatch(activeItem({ openItem: [item.id] }));
    }
    // eslint-disable-next-line
  }, [pathname]);

  const textColor =
    theme.palette.mode === ThemeMode.DARK ? "secondary.400" : "secondary.main";
  const iconSelectedColor = "primary.main";

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <ListItemButton
          component={Link}
          to={item.url}
          target={itemTarget}
          disabled={item.disabled}
          selected={isSelected}
          sx={{
            zIndex: 1201,
            pl: drawerOpen ? `${level * 20}px` : 1.5,
            py: !drawerOpen && level === 1 ? 1.25 : 1,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            ...(drawerOpen && {
              "&:hover": {
                bgcolor: "transparent",
              },
              "&.Mui-selected": {
                "&:hover": {
                  bgcolor: "transparent",
                },
                bgcolor: "transparent",
              },
            }),
            ...(drawerOpen &&
              level === 1 && {
                mx: 1.25,
                my: 0.5,
                borderRadius: 1,
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
                  bgcolor:
                    theme.palette.mode === ThemeMode.DARK
                      ? "primary.dark"
                      : "primary.lighter",
                  "&:hover": {
                    color: iconSelectedColor,
                    bgcolor:
                      theme.palette.mode === ThemeMode.DARK
                        ? "primary.main"
                        : "primary.light",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    bgcolor: "primary.main",
                    borderRadius: "0 2px 2px 0",
                  },
                },
              }),
            ...(!drawerOpen && {
              px: 2.75,
              justifyContent: "center",
              "&:hover": {
                bgcolor: "transparent",
                transform: "scale(1.05)",
              },
              "&.Mui-selected": {
                "&:hover": {
                  bgcolor: "transparent",
                  transform: "scale(1.05)",
                },
                bgcolor: "transparent",
              },
            }),
          }}
          {...(downLG && {
            onClick: () => dispatch(openDrawer(false)),
          })}
        >
          {itemIcon && (
            <Tooltip
              title={!drawerOpen && level === 1 ? item.title : ""}
              placement="right"
              arrow
              TransitionComponent={Zoom}
              enterDelay={300}
              leaveDelay={100}
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor:
                      theme.palette.mode === ThemeMode.DARK
                        ? "grey.800"
                        : "grey.700",
                    color: "common.white",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    boxShadow:
                      theme.palette.mode === ThemeMode.DARK
                        ? "0 4px 16px rgba(0,0,0,0.5)"
                        : "0 4px 16px rgba(0,0,0,0.2)",
                  },
                },
                arrow: {
                  sx: {
                    color:
                      theme.palette.mode === ThemeMode.DARK
                        ? "grey.800"
                        : "grey.700",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: isSelected ? iconSelectedColor : textColor,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  ...(!drawerOpen &&
                    level === 1 && {
                      borderRadius: 1,
                      width: 46,
                      height: 46,
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      position: "relative",
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === ThemeMode.DARK
                            ? "secondary.light"
                            : "secondary.200",
                        transform: "rotateY(10deg) scale(1.1)",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          inset: -2,
                          borderRadius: 1,
                          padding: 2,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                          maskComposite: "xor",
                          opacity: 0.6,
                        },
                      },
                    }),
                  ...(!drawerOpen &&
                    isSelected && {
                      bgcolor:
                        theme.palette.mode === ThemeMode.DARK
                          ? "secondary.100"
                          : "primary.lighter",
                      color: iconSelectedColor,
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%": {
                          boxShadow: `0 0 0 0 ${theme.palette.primary.main}40`,
                        },
                        "70%": {
                          boxShadow: `0 0 0 10px ${theme.palette.primary.main}00`,
                        },
                        "100%": {
                          boxShadow: `0 0 0 0 ${theme.palette.primary.main}00`,
                        },
                      },
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === ThemeMode.DARK
                            ? "secondary.200"
                            : "primary.lighter",
                        transform: "rotateY(10deg) scale(1.1)",
                      },
                    }),
                }}
              >
                {itemIcon}
              </ListItemIcon>
            </Tooltip>
          )}

          {!itemIcon && drawerOpen && (
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
                  sx={{
                    color: isSelected ? iconSelectedColor : textColor,
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: "0.875rem",
                    lineHeight: 1.4,
                    transition: "all 0.2s ease-in-out",
                    letterSpacing: isSelected ? "0.02em" : "0.01em",
                    ...(isSelected && {
                      textShadow:
                        theme.palette.mode === ThemeMode.DARK
                          ? "0 1px 2px rgba(0,0,0,0.5)"
                          : "0 1px 2px rgba(0,0,0,0.1)",
                    }),
                  }}
                >
                  {item.title}
                </Typography>
              }
            />
          )}
          {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
            <Chip
              color={item.chip.color}
              variant={item.chip.variant}
              size={item.chip.size}
              label={item.chip.label}
              avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
            />
          )}
        </ListItemButton>
      ) : (
        <ListItemButton
          component={Link}
          to={item.url}
          target={itemTarget}
          disabled={item.disabled}
          selected={isSelected}
          sx={{
            zIndex: 1201,
            ...(drawerOpen && {
              "&:hover": {
                bgcolor: "transparent",
              },
              "&.Mui-selected": {
                bgcolor: "transparent",
                color: iconSelectedColor,
                "&:hover": {
                  color: iconSelectedColor,
                  bgcolor: "transparent",
                },
              },
            }),
            ...(!drawerOpen && {
              "&:hover": {
                bgcolor: "transparent",
              },
              "&.Mui-selected": {
                "&:hover": {
                  bgcolor: "transparent",
                },
                bgcolor: "transparent",
              },
            }),
          }}
        >
          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: 36,
                ...(!drawerOpen && {
                  borderRadius: 1,
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  "&:hover": {
                    bgcolor: "transparent",
                  },
                }),
                ...(!drawerOpen &&
                  isSelected && {
                    bgcolor: "transparent",
                    "&:hover": {
                      bgcolor: "transparent",
                    },
                  }),
              }}
            >
              {itemIcon}
            </ListItemIcon>
          )}

          <ListItemText
            primary={
              <Typography
                variant="h6"
                sx={{
                  color: isSelected ? iconSelectedColor : textColor,
                  fontWeight: isSelected ? 500 : 400,
                }}
              >
                {item.title}
              </Typography>
            }
          />
          {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
            <Chip
              color={item.chip.color}
              variant={item.chip.variant}
              size={item.chip.size}
              label={item.chip.label}
              avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
              sx={{ ml: 1 }}
            />
          )}
        </ListItemButton>
      )}
    </>
  );
};

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
};

export default NavItem;
