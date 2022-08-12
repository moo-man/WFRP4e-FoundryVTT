const esbuild = require("esbuild")
const fs = require("fs")
const path = require("path")
const esCopy = require("esbuild-plugin-copy")
const copyStaticFiles = require("esbuild-copy-static-files")
const foundryPath = require("./foundry-path.js");

let manifest = JSON.parse(fs.readFileSync("./system.json"))

let systemPath = foundryPath.systemPath(manifest.id)

console.log("Bundling to " + systemPath)

esbuild.build({
    entryPoints: [`${manifest.id}.js`],
    bundle: true,
    outfile: path.join(systemPath, `${manifest.id}.js`),
    watch: process.env.NODE_ENV == "development",
    plugins: [
        copyStaticFiles({ // plugin-copy can't seem te retain folder structure without errors so use copy-static-files
            src: './static',
            dest: systemPath,
            errorOnExist: false,
            recursive: true,
        }),  
        esCopy.copy({ // copy-static-files can't do individual files so use plugin-copy
            resolveFrom: "cwd",
            assets: {
                from: [
                    "./system.json", 
                    "./template.json", 
            ],
                to: [systemPath + `/${manifest.id}`],
            }
        }), 
    ]


})