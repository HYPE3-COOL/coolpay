import React from 'react';

import styles from './TransactionDataTable.module.css';

import { TransactionType } from '@/interfaces/transaction.interface';
import { showTransactionInExplorer } from '@/utils/string';
import TransactionLinkButton from '@/components/common/buttons/TransactionLinkButton';
import { TransactionSelect } from '@/db/schema';


interface TransactionDataTableProps {
  transactions: TransactionSelect[];
}

function getAmountSign(type: TransactionType) {
  return type === TransactionType.Paid || type === TransactionType.Withdrawal ? '-' : '+';
}

export const TransactionDataTable: React.FC<TransactionDataTableProps> = ({ transactions }) => (
  <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <thead>
        <tr className={styles.headerRow}>
          <th className={styles.thDate}>Date</th>
          <th className={styles.thItem}>Item</th>
          <th className={styles.thAmount}>Amount (SOL)</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx, idx) => (
          <tr key={tx.id || idx} className={styles.row}>
            <td className={styles.tdDate}>{new Date(tx.created_at).toLocaleDateString()}</td>
            <td className={styles.tdItem}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                {tx.hash && (
                  <span style={{ marginLeft: 4 }}>
                    <TransactionLinkButton
                      url={showTransactionInExplorer(tx.hash)}
                      aria-label="View transaction on Solscan"
                    />
                  </span>
                )}
              </span>
            </td>
            <td className={styles.tdAmount}>
              {tx.amount !== undefined && tx.amount !== null
                ? `${getAmountSign(tx.type as TransactionType)}${(Number(tx.amount) / 1_000_000_000).toFixed(6)}`
                : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
