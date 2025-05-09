import fs from "fs";
import getSystemPath from "./foundry-path.mjs";
import copy from 'rollup-plugin-copy-watch';
import postcss from "rollup-plugin-postcss"
import bakedEnv from 'rollup-plugin-baked-env';

let manifest = JSON.parse(fs.readFileSync("./system.json"))

let systemPath = getSystemPath(manifest.id, manifest.compatibility.verified);

console.log("Bundling to " + systemPath)
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
                {src : "./system.json", dest : systemPath},
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