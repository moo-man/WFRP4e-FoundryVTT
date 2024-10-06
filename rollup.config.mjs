import fs from "fs";
import path from "path";
import getSystemPath from "./foundry-path.mjs";
import copy from 'rollup-plugin-copy-watch';
import postcss from "rollup-plugin-postcss"
import jscc from 'rollup-plugin-jscc';

let manifest = JSON.parse(fs.readFileSync("./system.json"))

let systemPath = getSystemPath(manifest.id)

console.log("Bundling to " + systemPath)
export default {
    input: [`${manifest.id}.js`, `./style/${manifest.id}.scss`],
    output: {
        dir : systemPath
        // file : path.join(systemPath, `${manifest.id}.js`)
    },
    watch : {
        clearScreen: true
    },
    plugins: [
        jscc({      
            values : {_ENV :  process.env.NODE_ENV}
        }),
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