import { notifications } from '@mantine/notifications';
import { useClipboard } from '@mantine/hooks';
import { Button } from '@mantine/core';

import styles from './CopyButton.module.css';

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
    const clipboard = useClipboard({ timeout: 1500 });
    return (
        <Button
            variant="subtle"
            size="compact-xs"
            className={styles.iconButton}
            onClick={() => {
                clipboard.copy(value);
                notifications.show({
                    title: 'Copied',
                    message: 'Copied to clipboard',
                    color: 'teal',
                    autoClose: 2000,
                });
            }}
        >
            <span className="icon-copy" />
        </Button>
    );
};

export default CopyButton;