import { createTamagui } from 'tamagui'
import { tokens } from '@tamagui/themes'

const config = createTamagui({
  tokens: {
    ...tokens,
    size: {
      small: 10,
      medium: 20,
      large: 30,
      true: 20,
    },
    color: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
    },
    zIndex: {
      small: 1,
      medium: 10,
      large: 100,
    },
  },
  themes: {
    light: {
      background: '#ffffff',
      color: '#000000',
    },
    dark: {
      background: '#000000',
      color: '#ffffff',
    },
  },
  shorthands: {
    bg: 'backgroundColor',
    fg: 'color',
  },
})

export default config