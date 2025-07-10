import { Button } from '@mantine/core';
import styles from './TransactionLinkButton.module.css';

interface TransactionLinkButtonProps {
    url: string;
    iconClassName?: string;
    ariaLabel?: string;
}

const TransactionLinkButton: React.FC<TransactionLinkButtonProps> = ({ url, iconClassName = 'icon-link', ariaLabel = 'View on Explorer' }) => (
    <Button
        variant="subtle"
        size="compact-xs"
        className={styles.iconButton}
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
    >
        <span className={iconClassName} />
    </Button>
);


export default TransactionLinkButton;