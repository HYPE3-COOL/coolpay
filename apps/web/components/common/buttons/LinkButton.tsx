import { Button } from '@mantine/core';
import styles from './LinkButton.module.css';

interface LinkButtonProps {
    url: string;
    iconClassName?: string;
    ariaLabel?: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({ url, iconClassName = 'icon-link', ariaLabel = 'View on Explorer' }) => (
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


export default LinkButton;