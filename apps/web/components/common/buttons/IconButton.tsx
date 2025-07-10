import React from 'react';
import { ActionIcon } from '@mantine/core';

import classes from './IconButton.module.css';

interface IconButtonProps {
  icon: React.ReactNode; // e.g. <span className={classes.icon + ' icon-link'} />
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  className,
  'aria-label': ariaLabel,
  ...rest
}) => (
  <ActionIcon
    className={classes.root + (className ? ` ${className}` : '')}
    onClick={onClick}
    aria-label={ariaLabel}
    {...rest}
  >
    {icon}
  </ActionIcon>
);
