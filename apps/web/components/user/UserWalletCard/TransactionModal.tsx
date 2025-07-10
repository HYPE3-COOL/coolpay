import React from 'react';
import { Modal } from '@mantine/core';

import { TransactionDataTable } from './TransactionDataTable';
import styles from './TransactionModal.module.css';
import { TransactionSelect } from '@/db/schema';

interface TransactionModalProps {
    opened: boolean;
    onClose: () => void;
    transactions: TransactionSelect[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ opened, onClose, transactions }) => (
    <Modal
        opened={opened}
        onClose={onClose}
        withCloseButton={false}
        centered
        classNames={styles}
        overlayProps={{ opacity: 1, blur: 3 }}
    >
        <TransactionDataTable transactions={transactions} />
    </Modal>
);
