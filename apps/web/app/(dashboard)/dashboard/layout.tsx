import { DevtoolsProvider } from "@/providers/devtools";
import { useNotificationProvider } from "@refinedev/antd";
import { GitHubBanner, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
// import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ColorModeContextProvider } from "@/contexts/color-mode";
import { authProviderClient } from "@/providers/auth-provider/auth-provider.client";
import { dataProvider } from "@/providers/data-provider";
import "@refinedev/antd/dist/reset.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";

  return (
    <RefineKbarProvider>
      <AntdRegistry>
        <ColorModeContextProvider defaultMode={defaultMode}>
          <DevtoolsProvider>
            <Refine
              routerProvider={routerProvider}
              dataProvider={dataProvider}
              notificationProvider={useNotificationProvider}
              authProvider={authProviderClient}
              resources={[
                {
                  name: "privy users",
                  list: "/dashboard/users",
                  // meta: {
                  //   canDelete: true,
                  // },
                },
                {
                  name: "transactions",
                  list: "/dashboard/transactions",

                },
                {
                  name: "activities",
                  list: "/dashboard/activities",

                },
                {
                  name: "x tweets",
                  list: "/dashboard/x-tweets",

                },
                {
                  name: "monitoring tweets",
                  list: "/dashboard/x-tweet-queues",
                },
                {
                  name: "x tweet analyzer",
                  list: "/dashboard/tweet-analyzer",
                },
                
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                projectId: "qbhJm7-mMJdu0-rYQCf3",
              }}
            >
              {children}
              {/* <RefineKbar /> */}
            </Refine>
          </DevtoolsProvider>
        </ColorModeContextProvider>
      </AntdRegistry>
    </RefineKbarProvider>
  )
}