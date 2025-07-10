import React from 'react';
import BaseButton from '../../BaseButton/BaseButton';

interface LoadMoreButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  alt?: string;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, className, alt }) => (
  <BaseButton
    label="Load More"
    icon="/assets/icons/more.png"
    onClick={onClick}
    className={className}
    alt={alt}
  />
);

export default LoadMoreButton;
