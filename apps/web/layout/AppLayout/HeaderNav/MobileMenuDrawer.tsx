import React from 'react';
import Link from 'next/link';
import { Drawer, useMantineTheme } from '@mantine/core';
import classes from './MobileMenuDrawer.module.css';
import { IconX } from '@tabler/icons-react';


interface MobileMenuDrawerProps {
  opened: boolean;
  onClose: () => void;
  navItems: { link: string; label: string }[];
  connectButton?: React.ReactNode;
}

const MobileMenuDrawer = ({ opened, onClose, navItems, connectButton }: MobileMenuDrawerProps) => {
  const theme = useMantineTheme();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      size="100%"
      overlayProps={{ opacity: 0.55, blur: 2 }}
      transitionProps={{ transition: 'slide-right', duration: 250 }}
      classNames={{ body: classes.drawerBody, }}
      closeButtonProps={{
        icon: <IconX size={30} stroke={2} color="white" />,
      }}
    >
      <div className={classes.logoWrapper}>
        <img src="/assets/logo.png" alt="Logo" className={classes.logoImg} />
      </div>
      <div className={classes.menuList}>
        {navItems.map((item) => (
          <Link key={item.label} href={item.link} className={classes.menuItem} onClick={onClose}>
            {item.label}
          </Link>
        ))}
      </div>
      {/* Show connect button at the bottom in mobile drawer */}
      {connectButton && (
        <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          {connectButton}
        </div>
      )}
    </Drawer>
  );
};

export default MobileMenuDrawer;
