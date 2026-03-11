import React, { useEffect } from "react";
import {
  alpha,
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useSelector } from "react-redux";
// import customizeComponents from "./customizations";

const SECONDARY = {
  lighter: "#C8FACD",
  light: "#5BE584",
  main: "#00AB55",
  dark: "#007B55",
  darker: "#005249",
  contrastText: "#FFF",
};
// SECONDARY
const PRIMARY = {
  lighter: "#D6E4FF",
  light: "#84A9FF",
  main: "#1939B7",
  dark: "#3366FF",
  darker: "#091A7A",
  contrastText: "#FFF",
};
// const PRIMARY = {
//   lighter: "#3d7ab7",
//   light: "#1d63a9",
//   main: "#004c99   ",
//   dark: "#00356b",
//   darker: "#00264c",
//   contrastText: "#4c4c4c   ",
// };

const SUCCESS = {
  lighter: "#E9FCD4",
  light: "#AAF27F",
  main: "#54D62C",
  dark: "#229A16",
  darker: "#08660D",
  contrastText: "#FFF",
};
const GREY = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
  500_8: alpha("#919EAB", 0.08),
  500_12: alpha("#919EAB", 0.12),
  500_16: alpha("#919EAB", 0.16),
  500_24: alpha("#919EAB", 0.24),
  500_32: alpha("#919EAB", 0.32),
  500_48: alpha("#919EAB", 0.48),
  500_56: alpha("#919EAB", 0.56),
  500_80: alpha("#919EAB", 0.8),
};

function ThemeProvider({ children }) {
  const { darkMode } = useSelector((state) => state.mytheme);
  useEffect(() => {
    console.log("mode", darkMode);
  }, [darkMode]);
  const themeOptionsLight = {
    palette: {
      primary: PRIMARY,
      secondary: SECONDARY,
      success: SUCCESS,
      text: { primary: GREY[900], secondary: GREY[700], disabled: GREY[600] },
      // text: { primary: GREY[800], secondary: GREY[600], disabled: GREY[500] },
      background: { paper: "#fff", default: "#fff", neutral: GREY[200] },
      action: {
        active: GREY[600],
        hover: GREY[500_8],
        selected: GREY[500_16],
        disabled: GREY[500_80],
        disabledBackground: GREY[500_24],
        focus: GREY[500_24],
        hoverOpacity: 0.08,
        disabledOpacity: 0.48,
      },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
          contained: {
            color: "white",
          },
        },
      },
    },
  };
  const themeOptionsDark = {
    palette: {
      mode: "dark",
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
          contained: {
            color: "white",
          },
        },
      },
    },
  };
  const theme = createTheme(darkMode ? themeOptionsDark : themeOptionsLight);
  // theme.components = customizeComponents(theme);
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

export default ThemeProvider;
