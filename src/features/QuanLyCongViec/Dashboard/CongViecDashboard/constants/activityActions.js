/**
 * CongViec Activity Action Mapping
 * Maps CongViec actions to icons and labels for RecentActivitiesCard
 */

import {
  DocumentText,
  Send,
  PlayCircle,
  TickCircle,
  MessageText,
  Chart,
} from "iconsax-react";

export const CONG_VIEC_ACTIONS = {
  // Trạng thái
  TAO_MOI: { icon: DocumentText, label: "tạo công việc", color: "info" },
  DA_GIAO: { icon: Send, label: "giao việc", color: "primary" },
  TIEP_NHAN: { icon: PlayCircle, label: "tiếp nhận", color: "success" },
  DANG_THUC_HIEN: { icon: Chart, label: "bắt đầu thực hiện", color: "info" },
  CHO_DUYET: { icon: DocumentText, label: "gửi xác nhận", color: "warning" },
  HOAN_THANH: { icon: TickCircle, label: "hoàn thành", color: "success" },
  TU_CHOI: { icon: DocumentText, label: "từ chối", color: "error" },
  MO_LAI: { icon: DocumentText, label: "mở lại", color: "warning" },
  HUY: { icon: DocumentText, label: "hủy", color: "error" },

  // Tiến độ
  CAP_NHAT_TIEN_DO: { icon: Chart, label: "cập nhật tiến độ", color: "info" },

  // Bình luận
  THEM_BINH_LUAN: { icon: MessageText, label: "bình luận", color: "default" },
  TRA_LOI_BINH_LUAN: {
    icon: MessageText,
    label: "trả lời bình luận",
    color: "default",
  },
};

/**
 * Get action config for a given action type
 * @param {string} action - Action type (e.g., "DA_GIAO")
 * @returns {Object} - { icon: Component, label: string, color: string }
 */
export const getActionConfig = (action) => {
  return (
    CONG_VIEC_ACTIONS[action] || {
      icon: DocumentText,
      label: action?.toLowerCase() || "cập nhật",
      color: "default",
    }
  );
};
