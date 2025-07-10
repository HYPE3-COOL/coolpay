import {
  Group,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
} from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';

import classes from './Logo.module.css';

type LogoProps = {
  href?: string;
} & UnstyledButtonProps;

const Logo = ({ href, ...others }: LogoProps) => {
  return (
    <UnstyledButton
      className={classes.logo}
      component={Link}
      href={href || '/'}
      {...others}
    >
      <Group gap="xs">
        <Image
          src="/assets/logo.png"
          height={24}
          width={24}
          // height={showText ? 32 : 24}
          // width={showText ? 32 : 24}
          alt="design sparx logo"
        />
        
      </Group>
    </UnstyledButton>
  );
};

export default Logo;
