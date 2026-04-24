import type { Config } from 'tailwindcss';
import viyoPreset from '@viyo/ui/tailwind-preset';

const config: Config = {
  presets: [viyoPreset as Config],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
