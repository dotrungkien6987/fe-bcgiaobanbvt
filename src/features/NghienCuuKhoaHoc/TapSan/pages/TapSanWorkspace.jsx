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
  Divider,
} from "@mui/material";
import { Article as ArticleIcon, Edit as EditIcon } from "@mui/icons-material";
import { fetchTapSanById, selectTapSanById } from "../slices/tapSanSlice";
import AttachmentSection from "../components/AttachmentSection";
import BaiBaoListPage from "./BaiBaoListPage";

// Component gộp Tổng quan + Đính kèm
function OverviewAndAttachments({ tapSan, id }) {
  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {tapSan?.Loai === "YHTH" ? "Y học thực hành" : "Thông tin thuốc"} -
            Năm {tapSan?.NamXuatBan} - Số {tapSan?.SoXuatBan}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`Trạng thái: ${
                tapSan?.TrangThai === "da-hoan-thanh"
                  ? "Đã hoàn thành"
                  : "Chưa hoàn thành"
              }`}
              color={
                tapSan?.TrangThai === "da-hoan-thanh" ? "success" : "warning"
              }
              size="small"
            />
            {tapSan?.NgayTao && (
              <Chip
                label={`Tạo: ${new Date(tapSan.NgayTao).toLocaleDateString(
                  "vi-VN"
                )}`}
                variant="outlined"
                size="small"
              />
            )}
            {tapSan?.NgayCapNhat && (
              <Chip
                label={`Cập nhật: ${new Date(
                  tapSan.NgayCapNhat
                ).toLocaleDateString("vi-VN")}`}
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Tệp kế hoạch
          </Typography>
          <AttachmentSection
            ownerType="TapSan"
            ownerId={id}
            field="kehoach"
            title="Tệp kế hoạch"
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Tệp tập san
          </Typography>
          <AttachmentSection
            ownerType="TapSan"
            ownerId={id}
            field="file"
            title="Tệp tập san"
          />
        </CardContent>
      </Card>
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
              <OverviewAndAttachments tapSan={tapSan} id={id} />
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
