import React, { useState } from 'react';
import { Modal, TextInput, NumberInput, Group, Box } from '@mantine/core';
import clsx from 'clsx';

import { ActionButton } from '@/components/common/buttons/ActionButton';
import { useSolanaBalance } from '@/hooks/useSolana';
import { usePrivy } from '@privy-io/react-auth';

import styles from './WithdrawModal.module.css';

interface WithdrawModalProps {
  opened: boolean;
  onClose: () => void;
  onWithdraw: (address: string, amount: number) => Promise<void>;
  loading?: boolean;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ opened, onClose, onWithdraw, loading }) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const { user } = usePrivy();

  const cluster = process.env.NEXT_PUBLIC_SOLANA_ENV === 'mainnet-beta' ? 'mainnet-beta' : 'devnet'; // Use 'devnet' or 'mainnet-beta' based on your environment
  const { balance, loading: balanceLoading, error: balanceError, refresh: refreshBalance } = useSolanaBalance(user?.wallet?.address, cluster);

  const FEE_SOL = 0.01;
  const maxTransferrable =
    typeof balance === 'number' && balance > FEE_SOL
      ? Number((balance - FEE_SOL).toFixed(6))
      : 0;

  const handleWithdraw = async () => {
    setError(null);
    if (!address || !amount || Number(amount) <= 0) {
      setError('Please enter a valid address and amount');
      return;
    }
    try {
      await onWithdraw(address, Number(amount));
      setAddress('');
      setAmount('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Withdraw failed');
    }
  };

  const handleAmountChange = (value: string | number) => {
    let newAmount: number | '' = '';
    if (value === '' || typeof value === 'number') {
      newAmount = value;
    } else if (typeof value === 'string') {
      if (/^0\.?\d*$/.test(value) || /^\d*\.?\d*$/.test(value)) {
        newAmount = value === '' ? '' : Number(value);
      }
    }
    setAmount(newAmount);
    // Check balance
    if (typeof newAmount === 'number' && balance !== undefined && !balanceLoading) {
      if (newAmount > Number(balance)) {
        setError('Insufficient balance');
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      classNames={{ content: styles.content }}
      overlayProps={{ opacity: 1, blur: 3 }}
    >
      <form className={styles.form} onSubmit={e => { e.preventDefault(); handleWithdraw(); }}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Recipient Address</label>
          <TextInput
            value={address}
            onChange={e => setAddress(e.currentTarget.value)}
            className={clsx(styles.input, styles.walletInput)}
            required
            styles={{ input: { boxShadow: 'none' } }}
            placeholder="Recipient wallet address"
          />
        </div>
        <div className={styles.inputGroup}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className={styles.inputLabel}>Amount (SOL)</label>
            <button
              className={styles.setMax}
              type="button"
              style={{ fontSize: 12, color: '#03e1ff', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => setAmount(maxTransferrable)}
              disabled={balanceLoading || maxTransferrable === 0}
              tabIndex={0}
            >
              Max
            </button>
          </div>
          <NumberInput
            value={amount}
            onChange={handleAmountChange}
            className={clsx(styles.input, styles.walletInput)}
            min={0}
            max={maxTransferrable}
            step={0.01}
            required
            decimalSeparator="."
            allowDecimal
            allowNegative={false}
            styles={{ input: { boxShadow: 'none' } }}
            placeholder="0.01"
          />
          {/* Error and max hint under NumberInput */}
          <div style={{ minHeight: 18, textAlign: 'right', color: error ? '#fa5252' : '#868e96', fontSize: 10, marginTop: 2 }}>
            {error ? error : (
              balanceLoading ? 'Loading balance...' : `Max: ${maxTransferrable} SOL`)
            }
          </div>
        </div>
        {/* Reserve space for error to prevent modal jump (legacy, now handled above) */}
        {/* <div className={styles.error} style={{ minHeight: 18 }}>
          {error}
        </div> */}
        <Group gap={15} justify="space-between" className={styles.buttonGroup} style={{ width: '100%' }}>
          <Box style={{ flex: 1 }}>
            <ActionButton
              label={loading ? 'Withdrawing...' : 'Withdraw'}
              leftSection={<span className="icon-withdraw" />}
              onClick={handleWithdraw}
              className={loading || error ? styles.disabledButton : ''}
              type="submit"
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <ActionButton
              label="Cancel"
              leftSection={null}
              onClick={onClose}
              type="button"
            />
          </Box>
        </Group>
      </form>
    </Modal>
  );
};
