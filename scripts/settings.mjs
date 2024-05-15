import esbuildCopyStaticFiles from 'esbuild-copy-static-files';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const staticDir = './static';
const srcDir = './src';
const wwwDir = './www';

export function createBuildSettings(options) {
  return {
    entryPoints: [`${srcDir}/main.ts`],
    outdir: wwwDir,
    platform: 'browser',
    bundle: true,
    plugins: [
      esbuildCopyStaticFiles({
        src: staticDir,
        dest: wwwDir,
      }),
      esbuildPluginTsc({
        force: true,
      }),
    ],
    ...options,
  };
}
