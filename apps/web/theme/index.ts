import { createTheme, Menu, rem, rgba } from '@mantine/core';

export const theme = createTheme({
  colors: {
    dark: [
      '#000',
      '#000',
      '#000',
      '#000',
      '#000',
      '#000',
      '#000',
      '#000',
      '#000',
      '#000',
    ],
    gray: [
      "rgba(255,255,255,0.5)", // 0
      '#E4E4E7', // 1
      '#D1D5DB', // 2
      '#9CA3AF', // 3
      '#6B7280', // 4
      '#4B5563', // 5
      '#374151', // 6
      '#1F2937', // 7
      '#111827', // 8
      '#000000', // 9
    ],
    //   primary: [
    //     'rgba(195, 255, 251, 0.05)',  // 10% opacity
    //     'rgba(195, 255, 251, 0.2)',  // 20% opacity
    //     'rgba(195, 255, 251, 0.3)',  // 30% opacity
    //     'rgba(195, 255, 251, 0.4)',  // 40% opacity
    //     'rgba(195, 255, 251, 0.5)',  // 50% opacity
    //     'rgba(195, 255, 251, 0.6)',  // 60% opacity
    //     'rgba(195, 255, 251, 0.7)',  // 70% opacity
    //     'rgba(195, 255, 251, 0.8)',  // 80% opacity
    //     'rgba(195, 255, 251, 0.9)',  // 90% opacity
    //     'rgba(195, 255, 251, 1)',    // 100% opacity
    //   ],
  },
  // primaryColor: 'primary',
  components: {
    //   Text: {
    //     defaultProps: {
    //       size: 'md',
    //       weight: 400,
    //       color: '#627170',
    //       lineClamp: 1,
    //       lineHeight: '1.5rem',
    //       textWrap: 'wrap',
    //       textOverflow: 'ellipsis',
    //       textAlign: 'left',
    //       textTransform: 'none',
    //       textDecoration: 'none',
    //     },

    //     styles: {
    //       root: {
    //         fontFamily: 'Inter, sans-serif',
    //       },
    //     },
    //   },
  },
  cursorType: 'pointer',
  fontFamily: 'Inter, sans-serif',
  fontSizes: {
    xxs: rem(10),
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
    xxl: rem(24),
  },
  breakpoints: {
    xs: '30em',
    sm: '40em',
    md: '48em',
    lg: '64em',
    xl: '80em',
    '2xl': '96em',
    '3xl': '120em',
    '4xl': '160em',
  },
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'bold',
    // textWrap: 'wrap' | 'nowrap' | 'balance' | 'pretty' | 'stable';
    sizes: {
      h1: {
        fontSize: '1.5rem', // 24px
        fontWeight: 'bold',
        lineHeight: '1.7',
      },
      h2: {
        fontSize: '1.25rem', // 20px
        fontWeight: '600',
        lineHeight: '1.5',
      },
      h3: {
        fontSize: '1.125rem', // 18px
        fontWeight: '600',
        lineHeight: '1.4',
      },
      h4: {
        fontSize: '1rem', // 16px
        fontWeight: '600',
        lineHeight: '1.3',
      },
      h5: {
        fontSize: '0.875rem', // 14px
        fontWeight: '500',
        lineHeight: '1.2',
      },
      h6: {
        fontSize: '0.75rem', // 12px
        fontWeight: '500',
        lineHeight: '1.1',
      },
    }
  }
})
