import React, { useState, useEffect } from 'react';
// import clsx from 'clsx';
import { Group, Input, Modal, TextInput, Button, Text } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import classes from './SearchInputBar.module.css';
import CreatorListItem from './CreatorListItem';
import { getCreators } from '@/hooks/useCreator';
import { useRouter } from 'next/navigation';
// import { PAGE_SIZE } from '@/constants/constant';
import { UserSelect } from '@/db/schema';

const SearchInputBar = () => {
    const [opened, setOpened] = useState(false);

    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 200);
    const router = useRouter();

    const [page, setPage] = useState(1);
    const [allCreators, setAllCreators] = useState<UserSelect[]>([]);
    const { data, isLoading } = getCreators({ pageSize: 20, page });
    const creators = data?.creators as UserSelect[] ?? [];
    const meta = data?.meta;

    const filteredCreators = creators.filter(
        (creator: any) =>
            creator.username.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    // When modal opens, clear the search input
    useEffect(() => {
        if (opened) setSearch('');
    }, [opened]);

    return (
        <div>
            <Input
                classNames={{
                    input: classes.searchBarInput,
                    section: classes.searchBarRightSection,
                }}
                type="text"
                placeholder="Search creators, topics, etc."
                rightSection={
                    <Group className={classes.rectangle} gap="4">
                        <img src="/assets/icons/search.svg" alt="Search" />
                        <span className={classes.label}>K</span>
                    </Group>
                }
                onClick={() => setOpened(true)}
            />

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                centered
                withCloseButton={false}
                overlayProps={{ opacity: 1, blur: 3 }}
                styles={{
                    content: {
                        padding: '0px',
                        borderRadius: '16px',
                        border: '1px solid rgba(3, 225, 255, 0.10)',
                        background: '#000708',
                        overflow: 'hidden',
                    },
                    body: {
                        padding: '0px',
                        maxHeight: '80vh',
                        minHeight: '300px',
                        overflowY: 'auto',
                    },
                    header: {
                        padding: '0px 16px',
                        borderBottom: '1px solid rgba(3, 225, 255, 0.10)',
                        background: '#000708',
                        minHeight: '50px',
                    },
                }}
                title={
                    <TextInput
                        // leftSection={
                        //     <span className="icon-search" style={{ color: '#627170', fontSize: '20px', marginRight: '12px' }} />
                        // }
                        classNames={{
                            input: classes.modalInput,
                        }}
                        w="100%"
                        placeholder="Search @twitterID"
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        p={0}
                    />
                }
            >
                {filteredCreators.length > 0 ? (
                    filteredCreators.map((creator: any) => (
                        <CreatorListItem
                            key={creator.id}
                            creator={creator}
                            onClick={() => {
                                router.push(`/creators/${creator.username}`);
                                setOpened(false);
                            }}
                        />
                    ))
                ) : (
                    <Text fz="h5" c="#fff" ta="center" mt="xl">
                        {isLoading ? 'Loading...' : 'No creators found'}
                    </Text>
                )}
            </Modal>
        </div>
    )
}

export default SearchInputBar