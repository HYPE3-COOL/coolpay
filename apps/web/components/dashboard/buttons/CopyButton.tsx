import React from "react";
import { Button, Tooltip, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

interface CopyButtonProps {
  value: string;
  tooltip?: string;
  size?: "small" | "middle" | "large";
  style?: React.CSSProperties;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  tooltip = "Copy to clipboard",
  size = "small",
  style,
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      message.success("Copied to clipboard");
    } catch (err) {
      message.error("Failed to copy");
    }
  };

  return (
    <Tooltip title={tooltip}>
      <Button
        type="link"
        size={size}
        icon={<CopyOutlined />}
        style={style}
        onClick={handleCopy}
      />
    </Tooltip>
  );
};
