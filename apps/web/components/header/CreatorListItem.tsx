import { Group, Text } from '@mantine/core';
import styles from './CreatorListItem.module.css';
// import { IUser } from '@/interfaces';
import { UserSelect } from '@/db/schema';

interface CreatorListItemProps {
  creator: UserSelect;
  onClick: () => void;
}

export default function CreatorListItem({ creator, onClick }: CreatorListItemProps) {
  return (
    <div
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <Group className={styles.CreatorListItem}>
        <div
          className={styles.tokenAvatar}
          style={{
            backgroundImage: `url('${creator.image}')`,
          }}
        />
        <div className={styles.tokenDetails}>
          <Text fz="h6" fw={500} c="white">
            {creator.username}
          </Text>
        </div>
      </Group>
    </div>
  );
}
