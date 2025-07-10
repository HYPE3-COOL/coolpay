import React from "react";
import { Button, Tooltip } from "antd";
import { LinkOutlined } from "@ant-design/icons";

interface ExplorerLinkButtonProps {
  url: string;
  tooltip?: string;
  size?: "small" | "middle" | "large";
  style?: React.CSSProperties;
}

export const ExplorerLinkButton: React.FC<ExplorerLinkButtonProps> = ({
  url,
  tooltip = "View on Explorer",
  size = "small",
  style,
}) => {
  return (
    <Tooltip title={tooltip}>
      <Button
        type="link"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        size={size}
        icon={<LinkOutlined />}
        style={style}
      />
    </Tooltip>
  );
};
