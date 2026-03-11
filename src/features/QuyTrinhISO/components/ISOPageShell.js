import {
  Box,
  Breadcrumbs,
  Container,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { ISO_HEADER_GRADIENT, ISO_SPACING } from "../theme/isoTokens";

/**
 * ISOPageShell — Shared page wrapper cho toàn bộ module QuyTrinhISO
 *
 * @param {Object}   props
 * @param {string|ReactNode}  props.title         - Tiêu đề hiển thị trong header
 * @param {string}   [props.subtitle]             - Dòng phụ nhỏ bên dưới title
 * @param {Array}    [props.breadcrumbs]          - [{label, to, icon?}] — item cuối = trang hiện tại (no link)
 * @param {ReactNode}[props.headerActions]        - Nút/actions nằm góc phải header
 * @param {ReactNode}[props.searchSlot]           - Ô tìm kiếm nhúng trong gradient header
 * @param {ReactNode}[props.subHeader]            - Filter bar / stats bar bên dưới gradient (nền trắng)
 * @param {ReactNode} props.children             - Nội dung chính trang
 * @param {boolean}  [props.maxWidth='xl']        - Container maxWidth
 */
function ISOPageShell({
  title,
  subtitle,
  breadcrumbs = [],
  headerActions,
  searchSlot,
  subHeader,
  children,
  maxWidth = "xl",
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        pb: ISO_SPACING.pagePb,
      }}
    >
      {/* ── Gradient Header ────────────────────────────────── */}
      <Box
        sx={{
          background: ISO_HEADER_GRADIENT,
          pt: ISO_SPACING.headerPt,
          pb: searchSlot ? ISO_SPACING.headerPb : { xs: 2, md: 2.5 },
          px: 2,
        }}
      >
        <Container maxWidth={maxWidth}>
          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={
                <NavigateNext
                  fontSize="small"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                />
              }
              sx={{ mb: 1.5 }}
            >
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                if (isLast) {
                  return (
                    <Typography
                      key={idx}
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.95)", fontWeight: 500 }}
                    >
                      {item.label}
                    </Typography>
                  );
                }
                return (
                  <Link
                    key={idx}
                    component={RouterLink}
                    to={item.to}
                    underline="hover"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.4,
                      color: "rgba(255,255,255,0.75)",
                      fontSize: "0.75rem",
                      "&:hover": { color: "white" },
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}

          {/* Title row */}
          <Stack
            direction="row"
            alignItems={subtitle ? "flex-start" : "center"}
            justifyContent="space-between"
            mb={searchSlot ? 2 : 0}
          >
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={700}
                color="white"
                sx={{ lineHeight: 1.2 }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.82)",
                    mt: 0.5,
                    fontSize: "0.82rem",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>

            {headerActions && (
              <Box sx={{ ml: 2, flexShrink: 0 }}>{headerActions}</Box>
            )}
          </Stack>

          {/* Search slot embedded in header */}
          {searchSlot && <Box>{searchSlot}</Box>}
        </Container>
      </Box>

      {/* ── Sub-header (filter bar / stats) ────────────────── */}
      {subHeader && (
        <Box
          sx={{
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container maxWidth={maxWidth}>{subHeader}</Container>
        </Box>
      )}

      {/* ── Main content ────────────────────────────────────── */}
      <Container maxWidth={maxWidth} sx={{ mt: ISO_SPACING.contentMt }}>
        {children}
      </Container>
    </Box>
  );
}

export default ISOPageShell;
