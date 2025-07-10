'use client';
import React, { useEffect } from 'react'
import BaseButton from '@/components/BaseButton/BaseButton';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePrivy } from '@privy-io/react-auth';
import { useMe } from '@/hooks/useMe';
import { Avatar, Menu, Modal, Button ,Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';

import { IconLogout } from '@tabler/icons-react';
import styles from './ConnectButton.module.css';

const ConnectButton = () => {
    const { login, logout } = useAuth();
    const { ready, authenticated, user } = usePrivy();
    const { data: authUser, isPending, refetch } = useMe();
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const router = useRouter();

    useEffect(() => {
        if (ready && authenticated) {
            refetch(); // Trigger `useMe` when the user is authenticated
        }
    }, [ready, authenticated, refetch]);


    if (authenticated) {
        return (
            <>
                <Menu
                    shadow="md"
                    width={180}
                    position="bottom-end"
                    classNames={{ dropdown: styles.menuDropdown }}
                    styles={{
                        item: { color: '#fff', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } },
                        label: { color: '#fff' },
                    }}
                >
                    <Menu.Target>
                        <Avatar
                            src={authUser?.image}
                            alt="User Avatar"
                            style={{ cursor: "pointer" }}
                        />
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={() => router.push('/profile')}>Profile</Menu.Item>
                        <Menu.Item onClick={openModal}>Disconnect</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
                <Modal
                    opened={modalOpened}
                    onClose={closeModal}
                    withCloseButton={false}
                    centered
                    classNames={styles}
                    overlayProps={{ opacity: 1, blur: 3 }}
                >
                    <Text fz="xs" c="white" mb={16}>
                        Are you sure you want to disconnect?
                    </Text>
                    <Button
                        color="red"
                        fullWidth
                        radius="md"
                        size="md"
                        className={styles.iconButton}
                        style={{ marginBottom: 8 }}
                        leftSection={<IconLogout size={18} stroke={1.5} />}
                        onClick={() => { logout(); closeModal(); }}
                    >
                        Yes, disconnect
                    </Button>
                    <Button
                        variant="subtle"
                        fullWidth
                        radius="md"
                        size="md"
                        className={styles.iconButton}
                        onClick={closeModal}
                    >
                        Cancel
                    </Button>
                </Modal>
            </>
        )
    }

    return (
        <BaseButton
            label="Connect"
            icon="/assets/images/globe.png"
            alt="Connect"
            onClick={() => login()}
        />

    )
}

export default ConnectButton