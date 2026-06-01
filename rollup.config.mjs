import fs from "fs";
import foundryPath from "./foundry-path.mjs";
import copy from 'rollup-plugin-copy-watch';
import postcss from "rollup-plugin-postcss"
import bakedEnv from 'rollup-plugin-baked-env';
import simpleGit from 'simple-git';
import yargs from 'yargs';

let args = yargs(process.argv.slice(2)).parse();

let latest = args.configLatest;
if (!latest)
{
    latest = await new Promise(resolve => {
        simpleGit({baseDir: process.cwd()}).tags((err, tags) => resolve(tags.latest));
    })
}

let manifest = JSON.parse(fs.readFileSync("./system.json"));
let systemPath = foundryPath(manifest.id, manifest.compatibility.verified);

console.log("Setting Version " + latest)
console.log("Bundling to " + systemPath);

export default {
    input: [`src/${manifest.id}.js`, `./style/${manifest.id}.scss`],
    output: {
        dir : systemPath
        // file : path.join(systemPath, `${manifest.id}.js`)
    },
    watch : {
        clearScreen: true
    },
    plugins: [
        bakedEnv(),
        copy({
            targets : [
                {src : "./template.json", dest : systemPath},
                {src : "./system.json", dest : systemPath, transform: (contents) => contents.toString().replaceAll("@VERSION", latest)},
                {src : "./WFRP-Header.jpg", dest : systemPath},
                {src : "./static/*", dest : systemPath},
            ],
            watch: process.env.NODE_ENV == "production" ? false : ["./static/*/**", "system.json", "template.json"]
        }),
        postcss({
            extract : `${manifest.id}.css`,
            plugins: []
          })
    ],
    onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === 'EVAL') return
        warn(warning)
    }
}