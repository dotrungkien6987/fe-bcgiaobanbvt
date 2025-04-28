import PropTypes from "prop-types";
import { forwardRef } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  useMediaQuery
} from "@mui/material";

// project-imports
import Highlighter from "./third-party/Highlighter";
import useConfig from "../hooks/useConfig";

// ==============================|| CUSTOM - MAIN CARD ||============================== //

const MainCard = forwardRef(
  (
    {
      border = true,
      boxShadow = true,
      children,
      subheader,
      content = true,
      contentSX = {},
      darkTitle,
      divider = true,
      elevation,
      secondary,
      shadow,
      sx = {},
      title,
      codeHighlight = false,
      codeString,
      modal = false,
      ...others
    },
    ref
  ) => {
    const theme = useTheme();
    const { themeContrast } = useConfig();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    // Responsive header style
    const headerSX = {
      p: isMobile ? 1.5 : 2.5,
      "& .MuiCardHeader-action": { m: "0px auto", alignSelf: "center" },
      color: 'white',
      backgroundColor: '#1939B7',
      // Responsive title
      "& .MuiCardHeader-title": {
        fontSize: {
          xs: '1.1rem',   // Mobile
          sm: '1.3rem',   // Tablet
          md: '1.5rem'    // Desktop
        },
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: isMobile ? 'normal' : 'nowrap'
      },
      // Responsive subheader
      "& .MuiCardHeader-subheader": {
        fontSize: {
          xs: '0.8rem',
          sm: '0.9rem',
          md: '1rem'
        }
      }
    };

    return (
      <Card
        elevation={elevation || 0}
        ref={ref}
        {...others}
        sx={{
          position: "relative",
          border: border ? "1px solid" : "none",
          borderRadius: 1.5,
          borderColor: theme.palette.divider,
          ...(((themeContrast && boxShadow) || shadow) && {
            boxShadow: shadow,
          }),
          ...(codeHighlight && {
            "& pre": {
              m: 0,
              p: "12px !important",
              fontFamily: theme.typography.fontFamily,
              fontSize: "0.75rem",
            },
          }),
          ...(modal && {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: `calc( 100% - 50px)`, sm: "auto" },
            "& .MuiCardContent-root": {
              overflowY: "auto",
              minHeight: "auto",
              maxHeight: `calc(100vh - 200px)`,
            },
          }),
          ...sx,
        }}
      >
        {/* card header and action */}
        {!darkTitle && title && (
          <CardHeader
            sx={headerSX}
            titleTypographyProps={{ 
              variant: isMobile ? "h5" : isTablet ? "h4" : "h3" 
            }}
            title={title}
            action={secondary}
            subheader={subheader}
          />
        )}
        {darkTitle && title && (
          <CardHeader
            sx={headerSX}
            title={
              <Typography 
                variant={isMobile ? "h6" : isTablet ? "h5" : "h4"}
                noWrap={!isMobile}
              >
                {title}
              </Typography>
            }
            action={secondary}
          />
        )}

        {/* content & header divider */}
        {title && divider && <Divider />}

        {/* card content */}
        {content && <CardContent sx={{
          p: isMobile ? 1.5 : 2.5,
          ...contentSX
        }}>{children}</CardContent>}
        {!content && children}

        {/* card footer - clipboard & highlighter  */}
        {codeString && (
          <>
            <Divider sx={{ borderStyle: "dashed" }} />
            <Highlighter
              codeString={codeString}
              codeHighlight={codeHighlight}
            />
          </>
        )}
      </Card>
    );
  }
);

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.node,
  subheader: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  content: PropTypes.bool,
  contentClass: PropTypes.string,
  contentSX: PropTypes.object,
  darkTitle: PropTypes.bool,
  divider: PropTypes.bool,
  elevation: PropTypes.number,
  secondary: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.object,
  ]),
  shadow: PropTypes.string,
  sx: PropTypes.object,
  title: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.object,
  ]),
  modal: PropTypes.bool,
  codeHighlight: PropTypes.bool,
  codeString: PropTypes.string,
};

export default MainCard;
