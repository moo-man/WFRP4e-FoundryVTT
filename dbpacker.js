import fs from "fs"
import {exec} from "child_process";
import getSystemPath from "./foundry-path.mjs";



let manifest = JSON.parse(fs.readFileSync("./system.json"))
let systemPath = getSystemPath(manifest.id)

exec(`fvtt package pack --type "System" --in "./packs/basic" -n "basic" --out "${systemPath}/packs"`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Packing Error: ${error}`);
        return;
      }
      console.log(stdout);
      console.error(stderr);
});

