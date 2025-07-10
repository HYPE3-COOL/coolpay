import React from 'react';

import classes from './ActionButton.module.css';
import { Button } from '@mantine/core';

interface ActionButtonProps {
    label: string;
    leftSection?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    label,
    leftSection,
    className,
    onClick,
    type = 'button',
    fullWidth = true,
    ...rest
}) => (
    <Button
        type={type}
        classNames={classes}
        leftSection={leftSection}
        onClick={onClick}
        fullWidth={fullWidth}
        {...rest}
    >
        {label}
    </Button>
);
