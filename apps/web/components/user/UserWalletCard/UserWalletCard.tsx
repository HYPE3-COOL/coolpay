'use client';

import React, { useState } from 'react';

import { Card, Group, Stack, Text, Button, Box, Flex, Loader } from '@mantine/core';

import { ActionButton } from '@/components/common/buttons/ActionButton';
import { CopyButton, LinkButton } from '@/components/common/buttons';

import { TransactionModal } from './TransactionModal';
import { WithdrawModal } from './WithdrawModal';

import styles from './UserWalletCard.module.css';

import { showExplorer } from '@/utils/string';

import { usePrivy } from '@privy-io/react-auth';
import { useFundWallet } from '@privy-io/react-auth/solana';

import { useSolanaBalance } from '@/hooks/useSolana';
import { useEmbeddedSolWithdraw } from '@/hooks/useEmbeddedSolWithdraw';
import { getTransactions } from '@/hooks/useTransaction';

export const UserWalletCard = () => {

    const [modalOpen, setModalOpen] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

    const { user } = usePrivy();
    const { fundWallet } = useFundWallet({
        onUserExited: ({ balance, address, cluster, fundingMethod }) => {
            console.log("User exited funding process");
            console.log({
                balance,
                address,
                cluster,
                fundingMethod
            })
            console.error("User exited during funding process");
        }
    });
    const cluster = process.env.NEXT_PUBLIC_SOLANA_ENV === 'mainnet-beta' ? 'mainnet-beta' : 'devnet'; // Use 'devnet' or 'mainnet-beta' based on your environment
    const { balance, loading: balanceLoading, error: balanceError, refresh: refreshBalance } = useSolanaBalance(user?.wallet?.address, cluster);
    const { withdraw, loading: withdrawLoading, error: withdrawError, txHash } = useEmbeddedSolWithdraw(cluster);
    const { data, isLoading: txLoading } = getTransactions();
    const transactions = data?.transactions ?? [];
    const meta = data?.meta;


    // https://docs.privy.io/wallets/funding/configuration
    const onDeposit = async () => {
        if (!user?.wallet?.address) {
            console.error("No wallet address found");
            return;
        }

        await fundWallet(user.wallet.address, {
            cluster: { name: 'devnet' }, // or 'mainnet-beta' for production
        })
    }

    const onWithdraw = async () => {
        setWithdrawModalOpen(true)
    }

    const handleWithdrawModal = async (address: string, amount: number) => {
        try {
            await withdraw(address, amount);
        } catch (e: any) {
            // Error notification is already handled in the hook
        }
    };


    return (
        <Card className={styles.walletCard} withBorder>
            <Stack style={{ height: '100%', width: "100%", justifyContent: 'flex-start' }}>
                <Box mb={7}>
                    <Text fz="xs" className={styles.label}>Your custodial wallet</Text>
                    <Group gap={9}>
                        {!user?.wallet?.address ? (
                            <Loader size={12} color="#03E1FF" />
                        ) : (
                            <Text className={styles.valueText}>
                                {user.wallet.address}
                            </Text>
                        )}
                        {user?.wallet?.address && (
                            <Box>
                                <CopyButton value={user.wallet.address} />
                                <LinkButton url={showExplorer(user.wallet.address)} />
                            </Box>
                        )}
                    </Group>
                </Box>

                <Box mb={7}>
                    <Text fz="xs" className={styles.label}>Balance</Text>
                    <Group justify='space-between' align='center'>
                        <Group gap={5}>
                            {balanceLoading ? (
                                <Loader size={12} color="#03E1FF" />
                            ) : (
                                <Text className={styles.valueText}>{balance ?? 0} SOL</Text>
                            )}
                            <Button
                                variant="subtle"
                                size="compact-xs"
                                className={styles.iconButton}
                                onClick={refreshBalance}
                            >
                                <span className="icon-refresh" />
                            </Button>
                        </Group>
                        <Text className={styles.viewTransactions} onClick={() => setModalOpen(true)} style={{ cursor: 'pointer' }}>View transactions</Text>
                    </Group>
                </Box>


                <Group gap={15} justify='space-between' w="100%">
                    <Box style={{ flex: 1 }}>
                        <ActionButton
                            label="Deposit"
                            leftSection={<span className="icon-deposit" />}
                            onClick={onDeposit}
                        />
                    </Box>
                    <Box style={{ flex: 1 }}>
                        <ActionButton
                            label={withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
                            leftSection={<span className="icon-withdraw" />}
                            onClick={onWithdraw}
                            className={withdrawLoading ? styles.disabledButton : ''}
                        />
                    </Box>
                </Group>

                <Flex justify="center">
                    <Text className={styles.warningText}>
                        <span className="icon-remark" />
                        Deposit and withdraw only SOL from this address
                    </Text>
                </Flex>

                <TransactionModal
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    transactions={transactions}
                />
                <WithdrawModal
                    opened={withdrawModalOpen}
                    onClose={() => setWithdrawModalOpen(false)}
                    onWithdraw={handleWithdrawModal}
                    loading={withdrawLoading}
                />
            </Stack>
        </Card>
    );
};
