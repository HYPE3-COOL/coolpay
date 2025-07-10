import React, { Suspense } from "react";
import { Metadata } from "next";
import AppLayout from '@/layout/AppLayout';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import '@mantine/notifications/styles.css';
import { theme } from '@/theme';
import AppProvider from "@/providers/AppProvider";

export const metadata: Metadata = {
  title: "CoolPay",
  description: "CoolPay is a platform for creators to monetize their content through subscriptions, tips, and more.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense>
      <AppProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <DatesProvider
            settings={{
              firstDayOfWeek: 0,
              weekendDays: [0],
              timezone: 'UTC',
            }}
          >
            <Notifications position="bottom-right" zIndex={1000} />
            <ModalsProvider>
              <AppLayout>{children}</AppLayout>
            </ModalsProvider>
          </DatesProvider>
        </MantineProvider>
      </AppProvider>
    </Suspense>
  )
}