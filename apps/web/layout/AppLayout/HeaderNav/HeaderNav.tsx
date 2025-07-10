import React, { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Burger } from '@mantine/core';

import classes from './HeaderNav.module.css';
import ConnectButton from '@/components/auth/ConnectButton/ConnectButton';
import MobileMenuDrawer from './MobileMenuDrawer';
import SearchInputBar from '@/components/header/SearchInputBar';
import { LINK_HOW_TO } from '@/constants/constant';

const NAV_ITEMS = [
  { link: '/explore', label: 'Explore', target: '_self' },
  { link: '/', label: 'Creators', target: '_self' },
  { link: LINK_HOW_TO, label: 'How It Works', target: '_blank' },
];

const HeaderNav = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);

  return (
    <nav className={classes.headerNavGrid}>
      <div className={classes.left}>
        <Link href="/" className={classes.logo}>
          <img className={classes.logoImg} src="/assets/logo.png" alt="Logo" />
        </Link>
        <div className={clsx(classes.navItems, classes.desktopOnly)}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.link} className={classes.navItem} target={item.target}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={classes.center}>
        <SearchInputBar />
      </div>

      <div className={classes.right}>
        {/* Burger only visible on mobile */}
        <Burger
          opened={drawerOpened}
          onClick={() => setDrawerOpened((o) => !o)}
          className={classes.mobileOnly}
          size={24}
          aria-label="Open navigation menu"
          style={{ padding: 8, borderRadius: 8, minWidth: 44, minHeight: 44 }}
        />
        {/* ConnectButton only visible on desktop */}
        <div className={classes.desktopOnly}>
          <ConnectButton />
        </div>
      </div>

      <MobileMenuDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        navItems={NAV_ITEMS}
        // Pass ConnectButton as a prop for mobile drawer
        connectButton={<ConnectButton />}
      />
    </nav>
  );
};

export default HeaderNav;
