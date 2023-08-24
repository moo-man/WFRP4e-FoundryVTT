const fs = require("fs")
const foundryPath = require("./foundry-path.js");
const {exec} = require("child_process");


let manifest = JSON.parse(fs.readFileSync("./system.json"))
let systemPath = foundryPath.systemPath(manifest.id)

exec(`fvtt package pack --type "System" --in "./packs/basic" -n "basic" --out "${systemPath}/packs"`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Packing Error: ${error}`);
        return;
      }
      console.log(stdout);
      console.error(stderr);
});

