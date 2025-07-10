"use client";

import { ColorModeContext } from "../../contexts/color-mode";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { usePrivy } from "@privy-io/react-auth";
import {
  Layout as AntdLayout,
  Avatar,
  Button,
  Space,
  Switch,
  theme,
  Typography,
} from "antd";
import React, { useContext, useEffect } from "react";

import { useMe } from "@/hooks/useMe";
import { useAuth } from "../providers/AuthProvider";

const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { mode, setMode } = useContext(ColorModeContext);
  const { login, logout } = useAuth();

  const { ready, authenticated, user } = usePrivy();
  const { data: authUser, isPending, refetch } = useMe();

  useEffect(() => {
    if (ready && authenticated) {
      refetch(); // Trigger `useMe` when the user is authenticated
    }
  }, [ready, authenticated, refetch]);

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        {!authenticated ? (
          <Button onClick={() => login()}>Connect</Button>
        ) : (
          <Avatar
            src={authUser?.image}
            alt="User Avatar"
            style={{ cursor: "pointer" }}
            onClick={logout} // Replace with desired action
          />
        )}
      </Space>
    </AntdLayout.Header>
  );
};