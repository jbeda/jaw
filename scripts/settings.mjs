import esbuildCopyStaticFiles from 'esbuild-copy-static-files';

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
    ],
    ...options,
  };
}
