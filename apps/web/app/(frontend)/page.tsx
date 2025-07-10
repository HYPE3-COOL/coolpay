'use client';

import React from 'react'
import {
  Container,
  ContainerProps,
  rem,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import classes from './HomePage.module.css';
import CreatorList from '@/components/creator/CreatorList';


export default function HomePage() {
  const tablet_match = useMediaQuery('(max-width: 768px)');

  const BOX_PROPS: ContainerProps = {
    pt: rem(120),
    pb: rem(80),
    px: tablet_match ? rem(20) : rem(20 * 3),
    className: classes.section,
  };

  return (
    <Container fluid {...BOX_PROPS}>
      <CreatorList />
    </Container>
  )
}
