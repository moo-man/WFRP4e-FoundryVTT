import fs from "fs";
import getSystemPath from "./foundry-path.mjs";
import copy from 'rollup-plugin-copy-watch';
import postcss from "rollup-plugin-postcss"
import jscc from 'rollup-plugin-jscc';

let manifest = JSON.parse(fs.readFileSync("./system.json"))

let systemPath = getSystemPath(manifest.id)

console.log("Bundling to " + systemPath)
export default {
    input: [`${manifest.id}.js`],
    output: {
        dir : systemPath,
        format: 'esm',
        sourcemap: true
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
            modules: false, // Set to true if you use CSS modules
            use: {
              sass: true,  // Enable SCSS processing
            }
        })
    ],
    onwarn(warning, warn) {
        // suppress eval warnings
        if (warning.code === 'EVAL') return
        warn(warning)
    }
}