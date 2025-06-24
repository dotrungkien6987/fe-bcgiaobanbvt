import React from "react";
import { Typography } from "@mui/material";
import { highlightVietnameseText } from "../../../utils/vietnameseUtils";

// Component để hiển thị văn bản có từ khóa được tô sáng (hỗ trợ tiếng Việt không dấu)
const HighlightText = ({
  text,
  searchTerm,
  variant = "body2",
  component = "span",
  ...props
}) => {
  const parts = highlightVietnameseText(text || "", searchTerm);

  return (
    <Typography variant={variant} component={component} {...props}>
      {parts.map((part, index) => {
        if (typeof part === "object" && part.highlight) {
          return (
            <span
              key={index}
              style={{
                backgroundColor: "#ffeb3b",
                fontWeight: "bold",
                padding: "1px 2px",
                borderRadius: "2px",
              }}
            >
              {part.text}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </Typography>
  );
};

export default HighlightText;
