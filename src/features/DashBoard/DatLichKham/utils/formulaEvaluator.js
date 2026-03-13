/**
 * @fileoverview Rule evaluator cho công thức lọc mãn tính
 * Đánh giá cây điều kiện AND/OR và tạo diễn giải tiếng Việt
 */

import { VARIABLE_DEFINITIONS } from "./formulaVariables";

/**
 * Danh sách toán tử hỗ trợ
 */
export const OPERATOR_DEFINITIONS = [
  { id: "==", label: "bằng", types: ["number", "boolean"] },
  { id: "!=", label: "khác", types: ["number", "boolean"] },
  { id: ">", label: "lớn hơn", types: ["number"] },
  { id: ">=", label: "lớn hơn hoặc bằng", types: ["number"] },
  { id: "<", label: "nhỏ hơn", types: ["number"] },
  { id: "<=", label: "nhỏ hơn hoặc bằng", types: ["number"] },
];

/**
 * Lấy label tiếng Việt của biến số
 */
function getVariableLabel(bienSo) {
  const def = VARIABLE_DEFINITIONS.find((v) => v.id === bienSo);
  return def ? def.label : bienSo;
}

/**
 * Lấy ký hiệu toán tử
 */
function getOperatorSymbol(toanTu) {
  const map = {
    "==": "=",
    "!=": "≠",
    ">": ">",
    ">=": "≥",
    "<": "<",
    "<=": "≤",
  };
  return map[toanTu] || toanTu;
}

/**
 * Format giá trị hiển thị
 */
function formatGiaTri(giaTri) {
  if (typeof giaTri === "boolean") return giaTri ? "Có" : "Không";
  return String(giaTri);
}

/**
 * So sánh giá trị theo toán tử
 */
function compare(actual, toanTu, expected) {
  switch (toanTu) {
    case "==":
      // eslint-disable-next-line eqeqeq
      return actual == expected;
    case "!=":
      // eslint-disable-next-line eqeqeq
      return actual != expected;
    case ">":
      return Number(actual) > Number(expected);
    case ">=":
      return Number(actual) >= Number(expected);
    case "<":
      return Number(actual) < Number(expected);
    case "<=":
      return Number(actual) <= Number(expected);
    default:
      return false;
  }
}

/**
 * Đánh giá 1 node điều kiện (recursive)
 *
 * @param {Object} node - Node điều kiện (group hoặc leaf)
 * @param {Object} variables - Giá trị biến số đã tính (từ computeVariables)
 * @returns {boolean} Kết quả đánh giá
 */
export function evaluateCondition(node, variables) {
  if (!node) return false;

  if (node.loai === "AND") {
    return (node.children || []).every((child) =>
      evaluateCondition(child, variables),
    );
  }
  if (node.loai === "OR") {
    return (node.children || []).some((child) =>
      evaluateCondition(child, variables),
    );
  }
  if (node.loai === "dieu_kien") {
    const actual = variables[node.bienSo];
    return compare(actual, node.toanTu, node.giaTri);
  }
  return false;
}

/**
 * Đánh giá + tạo diễn giải tiếng Việt cho từng điều kiện
 *
 * @param {Object} node - Node điều kiện (group hoặc leaf)
 * @param {Object} variables - Giá trị biến số đã tính
 * @returns {{ matched: boolean, explanations: string[] }} Kết quả + diễn giải
 */
export function evaluateWithExplanation(node, variables) {
  if (!node) return { matched: false, explanations: [] };

  if (node.loai === "AND" || node.loai === "OR") {
    const childResults = (node.children || []).map((child) =>
      evaluateWithExplanation(child, variables),
    );

    const matched =
      node.loai === "AND"
        ? childResults.every((r) => r.matched)
        : childResults.some((r) => r.matched);

    const explanations = childResults.flatMap((r) => r.explanations);

    return { matched, explanations };
  }

  if (node.loai === "dieu_kien") {
    const actual = variables[node.bienSo];
    const passed = compare(actual, node.toanTu, node.giaTri);
    const icon = passed ? "✓" : "✗";
    const varLabel = getVariableLabel(node.bienSo);
    const opSymbol = getOperatorSymbol(node.toanTu);

    let explanation;
    if (typeof node.giaTri === "boolean") {
      const actualStr = actual ? "Có" : "Không";
      const expectedStr = node.giaTri ? "Có" : "Không";
      explanation = `${varLabel} = ${actualStr} (${opSymbol} ${expectedStr}) ${icon}`;
    } else {
      explanation = `${varLabel} = ${actual} (${opSymbol} ${formatGiaTri(node.giaTri)}) ${icon}`;
    }

    return { matched: passed, explanations: [explanation] };
  }

  return { matched: false, explanations: [] };
}

/**
 * Tạo chuỗi diễn giải cấu trúc công thức (không cần data)
 * Dùng cho preview trong rule builder
 *
 * @param {Object} node - Node điều kiện
 * @returns {string} Chuỗi diễn giải
 */
export function formulaToText(node) {
  if (!node) return "";

  if (node.loai === "AND" || node.loai === "OR") {
    const connector = node.loai === "AND" ? " VÀ " : " HOẶC ";
    const parts = (node.children || []).map((child) => {
      const text = formulaToText(child);
      // Wrap sub-groups in parentheses
      if (child.loai === "AND" || child.loai === "OR") {
        return `(${text})`;
      }
      return text;
    });
    return parts.join(connector);
  }

  if (node.loai === "dieu_kien") {
    const varLabel = getVariableLabel(node.bienSo);
    const opSymbol = getOperatorSymbol(node.toanTu);
    return `${varLabel} ${opSymbol} ${formatGiaTri(node.giaTri)}`;
  }

  return "";
}

/**
 * Tạo node điều kiện mặc định (leaf)
 */
export function createDefaultCondition() {
  return {
    loai: "dieu_kien",
    bienSo: "soLanKham",
    toanTu: ">=",
    giaTri: 3,
  };
}

/**
 * Tạo group mặc định
 */
export function createDefaultGroup(loai = "AND") {
  return {
    loai,
    children: [createDefaultCondition()],
  };
}

/**
 * Tạo 1 step pipeline mặc định
 * @param {"loc"|"loaiTru"} loaiStep
 * @param {string} tenStep
 */
export function createDefaultStep(loaiStep = "loc", tenStep = "") {
  return {
    thuTu: 1,
    loaiStep,
    tenStep: tenStep || (loaiStep === "loc" ? "Điều kiện lọc" : "Loại trừ"),
    dieuKien: createDefaultGroup("AND"),
  };
}

/**
 * Tạo pipeline mặc định (1 bước Lọc)
 */
export function createDefaultPipeline() {
  return [createDefaultStep("loc", "Điều kiện chính")];
}

/**
 * Đảm bảo dữ liệu có format pipeline.
 * Backward compat: nếu là cây AND/OR đơn (legacy) → wrap thành 1-step pipeline.
 */
export function ensurePipeline(congThuc) {
  if (congThuc?.pipeline && congThuc.pipeline.length > 0) {
    return congThuc.pipeline;
  }
  // Legacy: chỉ có dieuKien
  if (congThuc?.dieuKien) {
    return [
      {
        thuTu: 1,
        loaiStep: "loc",
        tenStep: "Điều kiện chính",
        dieuKien: congThuc.dieuKien,
      },
    ];
  }
  return [];
}

/**
 * Đánh giá toàn bộ pipeline cho 1 bệnh nhân
 *
 * @param {Array} pipeline - Mảng step đã sorted theo thuTu
 * @param {Object} variables - Giá trị biến số (từ computeVariables)
 * @returns {{ matched: boolean, stepResults: Array<{ tenStep: string, loaiStep: string, thuTu: number, matched: boolean, explanations: string[] }> }}
 */
export function evaluatePipeline(pipeline, variables) {
  if (!Array.isArray(pipeline) || pipeline.length === 0) {
    return { matched: false, stepResults: [] };
  }

  const sortedSteps = [...pipeline].sort((a, b) => a.thuTu - b.thuTu);
  const stepResults = [];
  let finalMatched = true;

  for (const step of sortedSteps) {
    const { matched, explanations } = evaluateWithExplanation(
      step.dieuKien,
      variables,
    );

    const stepResult = {
      tenStep: step.tenStep || `Bước ${step.thuTu}`,
      loaiStep: step.loaiStep,
      thuTu: step.thuTu,
      matched,
      explanations,
    };
    stepResults.push(stepResult);

    if (step.loaiStep === "loc") {
      // "Lọc": BN phải pass (matched = true) mới đi tiếp
      if (!matched) {
        finalMatched = false;
        break;
      }
    } else if (step.loaiStep === "loaiTru") {
      // "Loại trừ": nếu BN match điều kiện → BỊ LOẠI
      if (matched) {
        finalMatched = false;
        break;
      }
    }
  }

  return { matched: finalMatched, stepResults };
}

/**
 * Tạo chuỗi diễn giải pipeline (không cần data)
 * Format dạng numbered list, mỗi bước 1 dòng, dễ đọc
 */
export function pipelineToText(pipeline) {
  if (!Array.isArray(pipeline) || pipeline.length === 0) return "";

  const sorted = [...pipeline].sort((a, b) => a.thuTu - b.thuTu);
  return sorted
    .map((step, idx) => {
      const typeLabel =
        step.loaiStep === "loc" ? "Lọc (giữ lại)" : "Loại trừ (loại bỏ)";
      const stepName = step.tenStep ? ` — ${step.tenStep}` : "";
      const condText = formulaToTextIndented(step.dieuKien, 1);
      return `Bước ${idx + 1}: ${typeLabel}${stepName}\n${condText}`;
    })
    .join("\n\n");
}

/**
 * Diễn giải cây điều kiện với indent, hiển thị rõ cấu trúc VÀ/HOẶC
 */
function formulaToTextIndented(node, level = 0) {
  if (!node) return "";
  const indent = "  ".repeat(level);

  if (node.loai === "AND" || node.loai === "OR") {
    const connector = node.loai === "AND" ? "VÀ" : "HOẶC";
    const children = node.children || [];
    if (children.length === 0) return "";
    if (children.length === 1) return formulaToTextIndented(children[0], level);
    return children
      .map((child, i) => {
        const prefix = i === 0 ? `${indent}• ` : `${indent}${connector} `;
        const childText = formulaToTextIndented(child, level + 1);
        // If child is a group, show connector label then children on new lines
        if (child.loai === "AND" || child.loai === "OR") {
          const groupLabel = child.loai === "AND" ? "(tất cả)" : "(một trong)";
          return `${prefix}${groupLabel}\n${childText}`;
        }
        return `${prefix}${childText.trimStart()}`;
      })
      .join("\n");
  }

  if (node.loai === "dieu_kien") {
    const varLabel = getVariableLabel(node.bienSo);
    const opSymbol = getOperatorSymbol(node.toanTu);
    return `${indent}${varLabel} ${opSymbol} ${formatGiaTri(node.giaTri)}`;
  }

  return "";
}

export const STEP_TYPE_LABELS = {
  loc: {
    label: "Lọc",
    color: "primary",
    moTa: "Giữ bệnh nhân nếu thỏa điều kiện",
  },
  loaiTru: {
    label: "Loại trừ",
    color: "error",
    moTa: "Loại bệnh nhân nếu khớp điều kiện",
  },
};
