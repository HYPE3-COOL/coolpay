import { Button } from '@mantine/core';
import classes from './TwitterButton.module.css';

interface TwitterButtonProps {
  username: string;
}

const TwitterButton: React.FC<TwitterButtonProps> = ({ username })  => {
  const url = `https://x.com/${username}`;
  return (
    <Button
      variant="subtle"
      size="compact-xs"
      classNames={classes}
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View Twitter"
    >
      <span className="icon-twitter" />
    </Button>
  );
};

export default TwitterButton;
