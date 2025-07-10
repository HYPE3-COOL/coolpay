import CustomSider from "@/components/sider";
import { Header } from "@/components/dashboard/header";
import { ThemedLayoutV2 } from "@refinedev/antd";
import React from "react";

export default function Layout({ children }: React.PropsWithChildren) {
  return <ThemedLayoutV2 Header={Header} Sider={CustomSider}>{children}</ThemedLayoutV2>;
}
