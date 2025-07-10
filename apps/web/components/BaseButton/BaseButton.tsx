import React from 'react';
import { Button } from '@mantine/core';
import clsx from 'clsx';
import classes from './BaseButton.module.css';

interface BaseButtonProps {
  label: string;
  icon: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  alt?: string;
  className?: string;
}

const BaseButton: React.FC<BaseButtonProps> = ({ label, icon, onClick, alt = '', className }) => {
  return (
    <Button
      className={clsx(classes.connectBtn, className)}
      onClick={onClick}
      leftSection={<img src={icon} alt={alt || label} className={classes.connectIcon} />}
      variant="filled"
      radius={8}
      style={{ boxShadow: '0px -0.5px 0px 0px #494848', background: '#111' }}
    >
      {label}
    </Button>
  );
};

export default BaseButton;
