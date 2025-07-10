import { ReactNode } from 'react';
import {
  AppShell,
  Box,
  ColorSchemeScript,
  MantineProvider,
  useMantineTheme,
} from '@mantine/core';
import HeaderNav from '@/layout/AppLayout/HeaderNav/HeaderNav';
import FooterNav from '@/layout/AppLayout/FooterNav/FooterNav';
import { useHeadroom } from '@mantine/hooks';
import Ticker from '@/components/Ticker/Ticker';

type GuestLayoutProps = {
  children: ReactNode;
};

function GuestLayout({ children }: GuestLayoutProps) {
  const theme = useMantineTheme();
  const pinned = useHeadroom({ fixedAt: 120 });

  return (
    <>
      <AppShell header={{ height: 60, collapsed: !pinned, offset: false }}>
        <AppShell.Header>
          <Ticker />
          <HeaderNav />
        </AppShell.Header>
        <AppShell.Main style={{ backgroundColor: '#000000' }}>
          <Box >
            {children}
          </Box>
          {/* <FooterNav /> */}
        </AppShell.Main>
      </AppShell>
    </>
  );
}

export default GuestLayout;
