const esbuild = require("esbuild")
const fs = require("fs")
const path = require("path")
const esCopy = require("esbuild-plugin-copy")
const copyStaticFiles = require("esbuild-copy-static-files")

let systemPath
if (process.env.NODE_ENV == "production")
{
    systemPath = "./build"
}
else 
{
    let foundryConfig = JSON.parse(fs.readFileSync("./foundryconfig.json"))
    systemPath = path.join(foundryConfig.path, "systems", foundryConfig.system)
}

console.log("Bundling to " + systemPath)

esbuild.build({
    entryPoints: ["wfrp4e.js"],
    bundle: true,
    outfile: path.join(systemPath, "wfrp4e.js"),
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
                    "./WFRP-Header.jpg"
            ],
                to: [systemPath + "/wfrpe"],
            }
        }), 

        // esCopy.copy({
        //     resolveFrom: "cwd",
        //     assets: {
        //         from: [
        //         "./fonts/**/*", 
        //         "./icons/**/*", 
        //         "./lang/**/*", 
        //         "./libs/**/*", 
        //         "./moo/**/*", 
        //         "./names/**/*", 
        //         "./packs/**/*", 
        //         "./sounds/**/*", 
        //         "./templates/**/*", 
        //         "./tokens/**/*", 
        //         "./ui/**/*"

        //     ],
        //         to: [systemPath],
        //         keepStructure : true
        //     }
        // })
    ]


})