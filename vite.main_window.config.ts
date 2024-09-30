import { ConfigEnv, UserConfig, defineConfig } from 'vite';
import path from 'path';
import { pluginExposeRenderer } from './vite.base.config';
import react from '@vitejs/plugin-react';

export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode,forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root: path.join(__dirname, 'src', 'ui', 'main'),
    mode,
    base: './',
    build: {
      outDir: `../../../.vite/ui/main_window/${name}`
    },
    plugins: [pluginExposeRenderer(name), react()],
    resolve: {
      preserveSymlinks: true
    },
    clearScreen: false,
    experimental: {
      renderBuiltUrl(filename: string) {
        console.log(filename);
        return { relative: true };
      }
    }
  } as UserConfig;
});
