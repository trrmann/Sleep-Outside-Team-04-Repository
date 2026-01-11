error found in the console was:  product-BopOnU2u.js:1  GET https://sleep-outside-team-04-repository.onrender.com/json/tents.json 404 (Not Found)

After review of the dist after the build the json files are not present in the distribution to go to render.

After review of the vite.config.js it has no reference to migrate the json files to the dist folder.

using AI for suggestions I posed this question:  where do i update the vite config to add the json data files

answer:
To include your JSON data files in the Vite build output, update your vite.config.js. You should use the public directory for static assets, but if you want to copy files from another location, use the Vite plugin vite-plugin-static-copy.

Here’s how to update vite.config.js:

Install vite-plugin-static-copy:
  npm install vite-plugin-static-copy --save-dev

In vite.config.js, add the plugin and configure it to copy your json folder to dist:
  import { defineConfig } from 'vite';
  import { viteStaticCopy } from 'vite-plugin-static-copy';

  export default defineConfig({
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'src/json/*',
            dest: 'json'
          }
        ]
      })
    ]
  });

This will copy all files from src/json to dist/json during the build. Alternatively, move your json files to a public folder at the project root for automatic copying.

i'm using pnpm instead so i ran:
  pnpm install vite-plugin-static-copy --save-dev
    was required to run the following first:  pnpm add -g pnpm 

  had to remove node modules folder and reinstall pnpm

  once pnpm was fixed and static opcy installed, then added the plugins section to teh config file.

  needed to change the single quotes to double to match the teams standard.

  needed to remove the /src in from the of the file source folder in the config in order for it to build correctly.

  pnpm run build
