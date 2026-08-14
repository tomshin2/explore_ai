import { createContext, useContext } from 'react';

export type ThemeColors = {
  bg: string;
  card: string;
  border: string;
  input: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentText: string;
  danger: string;
  warning: string;
  warningText: string;
  ripple: string;
  tabBar: string;
  avatarColors: string[];
};

export type Theme = { dark: boolean; colors: ThemeColors };

export const lightColors: ThemeColors = {
  bg: '#f2f2f7',
  card: '#ffffff',
  border: '#e5e5ea',
  input: '#f2f2f7',
  text: '#1c1c1e',
  textSecondary: '#3c3c43',
  textMuted: '#8e8e93',
  accent: '#007aff',
  accentText: '#ffffff',
  danger: '#ff3b30',
  warning: '#fff4d6',
  warningText: '#8a6d1a',
  ripple: 'rgba(0, 0, 0, 0.08)',
  tabBar: '#ffffff',
  avatarColors: ['#007aff', '#ff3b30', '#34c759', '#ff9500', '#af52de', '#5ac8fa'],
};

export const darkColors: ThemeColors = {
  bg: '#000000',
  card: '#1c1c1e',
  border: '#38383a',
  input: '#2c2c2e',
  text: '#ffffff',
  textSecondary: '#ebebf5',
  textMuted: '#8e8e93',
  accent: '#0a84ff',
  accentText: '#ffffff',
  danger: '#ff453a',
  warning: '#3a2d12',
  warningText: '#f0b429',
  ripple: 'rgba(255, 255, 255, 0.1)',
  tabBar: '#000000',
  avatarColors: ['#0a84ff', '#ff453a', '#30d158', '#ff9f0a', '#bf5af2', '#64d2ff'],
};

export const lightTheme: Theme = { dark: false, colors: lightColors };
export const darkTheme: Theme = { dark: true, colors: darkColors };

export const ThemeContext = createContext<Theme>(lightTheme);

export function useAppTheme(): Theme {
  return useContext(ThemeContext);
}
