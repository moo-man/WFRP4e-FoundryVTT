import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP_Tables from "../system/tables-wfrp4e.js";
import FoundryOverrides from "../system/overrides.js";

export default function() {
  /**
   * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
   */
  Hooks.on("ready", async () => {

    // // Localize strings in the  game.wfrp4e.config.object
    // for (let obj in  game.wfrp4e.config) {
    //   for (let el in  game.wfrp4e.config[obj]) {
    //     if (typeof  game.wfrp4e.config[obj][el] === "string") {
    //        game.wfrp4e.config[obj][el] = game.i18n.localize( game.wfrp4e.config[obj][el])
    //     }
    //   }
    // }

    let activeModules = game.settings.get("core", "moduleConfiguration");

    // Load module tables if the module is active and if the module has tables

    await new Promise(async (resolve) => {
      for (let m in activeModules) {
        if (activeModules[m]) {
          try {
            await FilePicker.browse("data", `modules/${m}/tables`).then(resp => {

              if (resp.error || !resp.target.includes("tables"))
                throw ""
              for (var file of resp.files) {
                try {
                  if (!file.includes(".json"))
                    continue
                  let filename = file.substring(file.lastIndexOf("/") + 1, file.indexOf(".json"));

                  fetch(file).then(r => r.json()).then(async records => {
                    // If extension of a table, add it to the columns
                    if (records.extend && WFRP_Tables[filename]) {
                      WFRP_Tables[filename].columns = WFRP_Tables[filename].columns.concat(records.columns)
                      WFRP_Tables[filename].rows.forEach((obj, row) => {
                        for (let c of records.columns)
                          WFRP_Tables[filename].rows[row].range[c] = records.rows[row].range[c]
                      })
                    }
                    else // If not extension or doesn't exist yet, load table as its filename 
                      WFRP_Tables[filename] = records;
                  })
                }
                catch (error) {
                  console.error("Error reading " + file + ": " + error)
                }
              }
            })
          }
          catch {
          }
        }
      }
      // Load tables from world if it has a tables folder
      await FilePicker.browse("data", `worlds/${game.world.name}/tables`).then(resp => {
        try {
          if (resp.error || !resp.target.includes("tables"))
            throw ""
          for (var file of resp.files) {
            try {
              if (!file.includes(".json"))
                continue
              let filename = file.substring(file.lastIndexOf("/") + 1, file.indexOf(".json"));

              fetch(file).then(r => r.json()).then(async records => {
                // If extension of a table, add it to the columns
                if (records.extend && WFRP_Tables[filename]) {
                  WFRP_Tables[filename].columns = WFRP_Tables[filename].columns.concat(records.columns)
                  WFRP_Tables[filename].rows.forEach((obj, row) => {
                    for (let c of records.columns)
                      WFRP_Tables[filename].rows[row].range[c] = records.rows[row].range[c]
                  })
                }
                else // If not extension, load table as its filename
                  WFRP_Tables[filename] = records;
              })
            }
            catch (error) {
              console.error("Error reading " + file + ": " + error)
            }
          }
        }
        catch
        {
          // Do nothing
        }
      })
      resolve()
    })


   

    // Wait for some time and send a table check socket
    if (game.user.isGM)
      game.settings.set("wfrp4e", "tables", WFRP_Utility._packageTables())
    else 
    {
      let tables = game.settings.get("wfrp4e", "tables")
      for(let table in tables)
        WFRP_Tables[table] = tables[table];
    }


    //***** Change cursor styles if the setting is enabled *****

    if (game.settings.get('wfrp4e', 'customCursor')) {
      console.log('wfrp4e | Using custom cursor')
      if (await srcExists("systems/wfrp4e/ui/cursors/pointer.png"))
      {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet')
        link.type = 'text/css'
        link.href = '/systems/wfrp4e/css/cursor.css'

        document.head.appendChild(link);
      }
      else 
      {
        console.warn("wfrp4e | No custom cursor found")
      }
    }
    // Socket Respnses - Morrslieb and opposed tests
    game.socket.on("system.wfrp4e", data => {
      if (data.type == "morrslieb")
        canvas.draw();

      else if (data.type == "target" && game.user.isGM) {
        let scene = game.scenes.get(data.payload.scene)
        let token = new Token(scene.getEmbeddedEntity("Token", data.payload.target))
        token.actor.update(
          {
            "flags.oppose": data.payload.opposeFlag
          })
      }
      else if (data.type == "updateMsg" && game.user.isGM)
      {
        game.messages.get(data.payload.id).update(data.payload.updateData)
      }
      else if (data.type == "deleteMsg" && game.user.isGM)
      {
        game.messages.get(data.payload.id).delete()
      }
    })

    
    const body = $("body");
    body.on("dragstart", "a.condition-chat", WFRP_Utility._onDragConditionLink)

    // Some entities require other entities to be loaded to prepare correctly (vehicles and mounts)
    for(let e of game.postReadyPrepare)
      e.prepareData();
    FoundryOverrides();
    canvas.tokens.placeables.forEach(t => t.drawEffects())

    let coreVersion = game.modules.get("wfrp4e-core")?.data?.version

    if (coreVersion == "1.11")
    {
      new Dialog({
        title: "WFRP4e Core Module Update",
        content: `<p><b>Please Read:</b>: Your WFRP4e Core Module is out of date. Due to an error on my part, Foundry doesn't recognize the update. This means you'll need to uninstall and reinstall the module frome the Foundry Main Menu. This should have no effect on your imported Core Content, however it is recommended you reinitialize to get the fixes. After reinstalling it, you should have version 1.2.0<br><br>To read more about the update, see <a href="https://github.com/moo-man/WFRP4e-FoundryVTT/releases/tag/3.3.0">Release Notes</a><br><br>Apologies for the inconvenience,<br>Moo Man</p>`,
        buttons: {
          ok: {
            label: "Ok",
          }
        }
      }).render(true)
    }
  })
      //   const NEEDS_MIGRATION_VERSION = "2.0.3";
      //   let needMigration
      //   try {
      //     needMigration = !isNewerVersion(game.settings.get("wfrp4e", "systemMigrationVersion"), NEEDS_MIGRATION_VERSION)
      //   }
      //   catch
      //   {
      //     needMigration = true;
      //   }
      //   if (needMigration && game.user.isGM) {
      //     new Dialog({
      //       title: "A Glimmer of Hope",
      //       content: `<p>Regarding the content wipe, I can't thank everyone enough for the emails sent to Cubicle 7. They are very supportive of implementing official modules for WFRP4e on Foundry. However, this will take time, so stay on the lookout! <br><br>Moo Man</p>`,
      //       buttons: {
      //         migrate: {
      //           label: "Praise Sigmar",
      //           callback: () => { game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version) }
      //         }
      //       }
      //     }).render(true)
      //   }
      // })
}