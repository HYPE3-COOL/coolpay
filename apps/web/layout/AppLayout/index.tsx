'use client';
import { ReactNode } from 'react';

import { AppShell, Box, useMantineTheme } from '@mantine/core';
import HeaderNav from '@/layout/AppLayout/HeaderNav/HeaderNav';
// import FooterNav from '@/layout/AppLayout/FooterNav/FooterNav';
import { useHeadroom } from '@mantine/hooks';

// import Ticker from '@/components/Ticker/Ticker';

type AppLayoutProps = {
  children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  const theme = useMantineTheme();
  const pinned = useHeadroom({ fixedAt: 120 });

  return (
    <>
      <AppShell header={{ height: 60, collapsed: !pinned, offset: false }}>
        <AppShell.Header>
          {/* <Ticker /> */}
          <HeaderNav />
        </AppShell.Header>
        <AppShell.Main>
          <Box > 
            {children}
          </Box>
          {/* <FooterNav /> */}
        </AppShell.Main>
      </AppShell>
    </>
  );
}

export default AppLayout;
