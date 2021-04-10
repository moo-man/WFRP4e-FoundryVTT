import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP_Tables from "../system/tables-wfrp4e.js";
import FoundryOverrides from "../system/overrides.js";
import Migration from "../system/migrations.js";
import SocketHandlers from "../system/socket-handlers.js";

export default function() {
  /**
   * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
   */
  Hooks.on("ready", async () => {

    
  Object.defineProperty(game.user, "isUniqueGM", {
    get: function() { return game.user.id == game.users.find(u => u.active && u.isGM)?.id}
  })
  

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

    if (game.user.isGM)
      await game.settings.set("wfrp4e", "tables", WFRP_Utility._packageTables())
    else 
    {
      let tables = game.settings.get("wfrp4e", "tables")
      for(let table in tables)
        WFRP_Tables[table] = tables[table];
    }

    game.wfrp4e.utility.addTablesToSidebar(ui.sidebar._element.find("#tables"))

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
    
    game.socket.on("system.wfrp4e", data => {
      SocketHandlers[data.type](data)
    })

    
    const body = $("body");
    body.on("dragstart", "a.condition-chat", WFRP_Utility._onDragConditionLink)

    // if (game.modules.get("about-time") && game.modules.get("about-time").active && game.user.isUniqueGM)
    //   game.Gametime.doEvery(GM{hours:24}, () => {
    //     game.actors.entities.filter(a => a.hasPlayerOwner).forEach(a => {
    //       a.decrementDiseases()
    //       a.decrementInjuries()
    //     })
    //   })



    if (!game.settings.get("wfrp4e", "systemMigrationVersion"))
      game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version)
    else {
      // const NEEDS_MIGRATION_VERSION = "3.3.3";
      // let needMigration
      // try {
      //   needMigration = game.settings.get("wfrp4e", "systemMigrationVersion") && !isNewerVersion(game.settings.get("wfrp4e", "systemMigrationVersion"), NEEDS_MIGRATION_VERSION)
      // }
      // catch
      // {
      //   needMigration = false;
      // }
      // if (needMigration && game.user.isGM) {
      //   new Dialog({
      //     title: "Storm of Chaos",
      //     content: `<h2>Migration to 3.4.0 - PLEASE READ</h2><p><b>If this is a new world, you can safely skip this dialog.</b><br><br>WFRP4e 3.4.0 requires a migration process in order to utilize Active Effects. This process goes through all items in the world (including owned items) and matches that name with a compendium item, and then replaces the item data with the compendium data. Note that this means any renamed trait, spell, etc. will not get updated.<br><br>Please ensure the <b>WFRP Core Module</b> is <u>active</u> and <u>atleast version 1.3.0</u><br><br>This update has moved a lot of hard coding away in favor of Active Effects, so skipping migration will cause various auto-calculations (e.g. Hardy) to not work unless you reimport the Item. <b>The Storm of Chaos is dangerous. SO BACK UP BEFORE BEGINNING THIS PROCESS.</b> You can safely close this dialog (not skip) and it will reappear on next refresh.<br><br>If possible, I recommend reinitializing the modules to avoid issues, but if not, I've tried to provide the best possible migration I could.<br><br>Thanks,<br>Moo Man</p>`,
      //     buttons: {
      //       migrate: {
      //         label: "Migrate",
      //         callback: () => { 
      //           new Migration().migrateWorld()
      //           game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version)
      //         }
      //       },
      //       skip : {
      //         label : "Skip",
      //         callback: ()=> {
      //           ui.notifications.info("Please be aware that skipping migration may result in incorrect calculations in existing actors (e.g. Hardy will not be calculated).", {permanent : true})
      //           game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version)
      //         }
      //       }
      //     }
      //   }).render(true)
      // }
    }




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
        content: `<p><b>Please Read:</b> Your WFRP4e Core Module is out of date. Due to an error on my part, Foundry doesn't recognize the update. This means you'll need to uninstall and reinstall the module from the Foundry Main Menu. This should have no effect on your imported Core Content, however it is recommended you reinitialize to get the fixes. After reinstalling it, you should have version 1.2.0<br><br>To read more about the update, see <a href="https://github.com/moo-man/WFRP4e-FoundryVTT/releases/tag/3.3.0">Release Notes</a><br><br>Apologies for the inconvenience,<br>Moo Man</p>`,
        buttons: {
          ok: {
            label: "Ok",
          }
        }
      }).render(true)
    }
  })
}
  