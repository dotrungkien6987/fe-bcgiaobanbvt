import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Stack,
  Tabs,
  Tab,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Grid,
  Paper,
} from "@mui/material";
import {
  Article as ArticleIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Book as BookIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { fetchTapSanById, selectTapSanById } from "../slices/tapSanSlice";
import AttachmentSection from "../components/AttachmentSection";
import BaiBaoListPage from "./BaiBaoListPage";

// Component gộp Tổng quan + Đính kèm
function OverviewAndAttachments({ tapSan, id, baiBaoCount = 0 }) {
  const loaiTapSanLabel =
    tapSan?.Loai === "YHTH"
      ? "Tập san y học thực hành"
      : "Tập san thông tin thuốc";
  const maTapSan = `${tapSan?.Loai}-${tapSan?.NamXuatBan}-${String(
    tapSan?.SoXuatBan
  ).padStart(2, "0")}`;

  return (
    <Stack spacing={3}>
      {/* Header Card - Thông tin cơ bản */}
      <Card
        elevation={3}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            📖 {loaiTapSanLabel}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
            Năm {tapSan?.NamXuatBan} - Số {tapSan?.SoXuatBan} | Mã: {maTapSan}
          </Typography>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Cột trái - Thông tin chi tiết */}
        <Grid item xs={12} lg={12}>
          <Stack spacing={3}>
            {/* Thông tin xuất bản */}
            <Card elevation={2}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <BookIcon color="primary" />
                  📚 Thông tin xuất bản
                </Typography>
                {/* Trạng thái (đưa lên trên khối thông tin xuất bản) */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={
                      tapSan?.TrangThai === "da-hoan-thanh"
                        ? "Đã hoàn thành"
                        : "Chưa hoàn thành"
                    }
                    color={
                      tapSan?.TrangThai === "da-hoan-thanh"
                        ? "success"
                        : "warning"
                    }
                    size="small"
                  />
                  <Chip
                    label={`${baiBaoCount} bài báo`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={4}>
                    <Paper
                      sx={{ p: 2, textAlign: "center", bgcolor: "primary.50" }}
                    >
                      <Typography
                        variant="h4"
                        color="primary.main"
                        fontWeight="bold"
                      >
                        {tapSan?.NamXuatBan}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Năm xuất bản
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Paper
                      sx={{ p: 2, textAlign: "center", bgcolor: "success.50" }}
                    >
                      <Typography
                        variant="h4"
                        color="success.main"
                        fontWeight="bold"
                      >
                        {tapSan?.SoXuatBan}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Số xuất bản
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper
                      sx={{ p: 2, textAlign: "center", bgcolor: "info.50" }}
                    >
                      <Typography
                        variant="h4"
                        color="info.main"
                        fontWeight="bold"
                      >
                        {baiBaoCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng bài báo
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Cột phải - Tệp đính kèm */}
        <Grid item xs={12} lg={12}>
          <Stack spacing={3}>
            {/* Tệp đính kèm - 2 khối 50/50 trên cùng dòng */}
            <Card elevation={2}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <FolderIcon color="primary" />� Tệp đính kèm
                </Typography>
                <Grid container spacing={2}>
                  {/* Tệp kế hoạch - 50% */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: "100%", bgcolor: "primary.50" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        📋 Kế hoạch
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, fontSize: "0.75rem" }}
                      >
                        Kế hoạch xuất bản và timeline
                      </Typography>
                      <AttachmentSection
                        ownerType="TapSan"
                        ownerId={id}
                        field="kehoach"
                        title=""
                      />
                    </Paper>
                  </Grid>

                  {/* Tệp tập san - 50% */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: "100%", bgcolor: "success.50" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        📄 Tập san
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, fontSize: "0.75rem" }}
                      >
                        File PDF và tài liệu hoàn chỉnh
                      </Typography>
                      <AttachmentSection
                        ownerType="TapSan"
                        ownerId={id}
                        field="file"
                        title=""
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card elevation={2} sx={{ bgcolor: "grey.50" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  ⚡ Thao tác nhanh
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ArticleIcon />}
                    onClick={() =>
                      window.open(`/tapsan/${id}/baibao`, "_blank")
                    }
                  >
                    Quản lý bài báo
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={() => window.open(`/tapsan/${id}/edit`, "_blank")}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function CommandBar({ onAddBaiBao, onEditTapSan, onOpenBaibao }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        p: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        bgcolor: "background.paper",
        zIndex: 10,
      }}
    >
      <Button
        variant="contained"
        startIcon={<ArticleIcon />}
        onClick={onAddBaiBao}
      >
        Thêm bài báo
      </Button>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={onEditTapSan}
      >
        Sửa tập san
      </Button>
      <Button startIcon={<ArticleIcon />} onClick={onOpenBaibao}>
        Quản lý bài báo
      </Button>
    </Stack>
  );
}

export default function TapSanWorkspace() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "overview";

  const tapSan = useSelector((state) => selectTapSanById(state, id));
  const [loading, setLoading] = React.useState(!tapSan);

  // Lấy meta bài báo từ cache (không ép fetch ở đây)
  const baiBaoMeta = useSelector((state) => state.baiBao?.byTapSan?.[id]);
  const baiBaoCount = baiBaoMeta?.total ?? baiBaoMeta?.ids?.length ?? 0;

  React.useEffect(() => {
    let active = true;
    if (!tapSan) {
      setLoading(true);
      dispatch(fetchTapSanById(id))
        .unwrap()
        .finally(() => active && setLoading(false));
    }
    return () => {
      active = false;
    };
  }, [id, tapSan, dispatch]);

  // Redirect tương thích nếu còn tab=attachments
  React.useEffect(() => {
    if (tab === "attachments") {
      setSp({ tab: "overview" }, { replace: true });
    }
  }, [tab, setSp]);

  const onTabChange = (_, v) => setSp({ tab: v });
  const onAddBaiBao = () => setSp({ tab: "baibao", action: "add" });
  const onEditTapSan = () => navigate(`/tapsan/${id}/edit`);
  const onOpenBaibao = () => navigate(`/tapsan/${id}/baibao`);

  return (
    <Box>
      {/* Back Button */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/tapsan")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "primary.main",
            color: "primary.main",
            "&:hover": {
              backgroundColor: "primary.50",
              borderColor: "primary.dark",
            },
          }}
        >
          Quay lại danh sách tập san
        </Button>
      </Box>

      <CommandBar
        onAddBaiBao={onAddBaiBao}
        onEditTapSan={onEditTapSan}
        onOpenBaibao={onOpenBaibao}
      />

      <Tabs value={tab} onChange={onTabChange} sx={{ px: 1.5 }}>
        <Tab label="Tổng quan" value="overview" />
        <Tab
          label={baiBaoCount > 0 ? `Bài báo (${baiBaoCount})` : "Bài báo"}
          value="baibao"
        />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {loading ? (
          <Card>
            <CardContent>
              <Skeleton variant="text" width={240} height={36} />
              <Skeleton variant="rectangular" height={160} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        ) : (
          <>
            {tab === "overview" && (
              <OverviewAndAttachments
                tapSan={tapSan}
                id={id}
                baiBaoCount={baiBaoCount}
              />
            )}
            {tab === "baibao" && (
              <Box sx={{ p: 0 }}>
                <BaiBaoListPage tapSanId={id} embedded />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
