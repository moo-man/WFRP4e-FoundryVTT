import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP4E from "../system/config-wfrp4e.js"
import WFRP_Tables from "../system/tables-wfrp4e.js";

export default function() {
  /**
   * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
   */
  Hooks.on("ready", async () => {

    // Localize strings in the WFRP4E object
    for (let obj in WFRP4E) {
      for (let el in WFRP4E[obj]) {
        if (typeof WFRP4E[obj][el] === "string") {
          WFRP4E[obj][el] = game.i18n.localize(WFRP4E[obj][el])
        }
      }
    }

    let activeModules = game.settings.get("core", "moduleConfiguration");

    // Load module tables if the module is active and if the module has tables
    for (let m in activeModules) {
      let module;
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
                  else // If not extension, load table as its filename
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

    // ***** Change cursor styles if the setting is enabled *****

    if (game.settings.get('wfrp4e', 'customCursor')) {
      console.log('wfrp4e | Using custom cursor')
      let link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet')
      link.type = 'text/css'
      link.href = '/systems/wfrp4e/css/cursor.css'

      document.head.appendChild(link);
    }

    // ***** FVTT functions with slight modification to include pseudo entities *****

    TextEditor._replaceContentLinks = function (match, entityType, id, name) {

      // Match Compendium content
      if (entityType === "Compendium") {
        return this._replaceCompendiumLink(match, id, name);
      }

      else if (WFRP4E.PSEUDO_ENTITIES.includes(entityType)) {
        return WFRP_Utility._replaceCustomLink(match, entityType, id, name)
      }

      // Match World content
      else {
        return this._replaceEntityLink(match, entityType, id, name);``
      }
    }

    TextEditor.enrichHTML = function (content, { secrets = false, entities = true, links = true, rolls = true } = {}) {
      let html = document.createElement("div");
      html.innerHTML = content;

      // Strip secrets
      if (!secrets) {
        let elements = html.querySelectorAll("section.secret");
        elements.forEach(e => e.parentNode.removeChild(e));
      }

      // Match content links
      if (entities) {
        const entityTypes = CONST.ENTITY_LINK_TYPES.concat("Compendium").concat(WFRP4E.PSEUDO_ENTITIES);;
        const entityMatchRgx = `@(${entityTypes.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`;
        const rgx = new RegExp(entityMatchRgx, 'g');

        // Find and preload compendium indices
        const matches = Array.from(html.innerHTML.matchAll(rgx));
        if (matches.length) this._preloadCompendiumIndices(matches);

        // Replace content links
        html.innerHTML = html.innerHTML.replace(rgx, this._replaceContentLinks.bind(this));
      }

      // Replace hyperlinks
      if (links) {
        let rgx = /(?:[^\S]|^)((?:(?:https?:\/\/)|(?:www\.))(?:\S+))/gi;
        html.innerHTML = html.innerHTML.replace(rgx, this._replaceHyperlinks);
      }

      // Process inline dice rolls
      if (rolls) {
        const rgx = /\[\[(\/[a-zA-Z]+\s)?([^\]]+)\]\]/gi;
        html.innerHTML = html.innerHTML.replace(rgx, this._replaceInlineRolls);
      }

      // Return the enriched HTML
      return html.innerHTML;
    };


    // Modify the initiative formula depending on whether the actor has ranks in the Combat Reflexes talent
    Combat.prototype._getInitiativeFormula = function (combatant) {
      const actor = combatant.actor;
      let initiativeFormula = CONFIG.Combat.initiative.formula || game.system.data.initiative;
      let initiativeSetting = game.settings.get("wfrp4e", "initiativeRule")

      if (!actor) return initiativeFormula;
      let combatReflexes = 0;
      for (let item of actor.items) {
        if (item.type == "talent" && item.data.name == game.i18n.localize("NAME.CombatReflexes"))
          combatReflexes += item.data.data.advances.value;
      }

      if (!combatReflexes) return initiativeFormula

      switch (initiativeSetting) {
        case "default":
          initiativeFormula = initiativeFormula + `+ ${combatReflexes * 10}`;
          break;

        case "sl":
          initiativeFormula = `(floor((@characteristics.i.value + ${combatReflexes * 10})/ 10) - floor(1d100/10))`
          break;

        case "d10Init":
          initiativeFormula = initiativeFormula + `+ ${combatReflexes * 10}`;
          break;

        case "d10InitAgi":
          initiativeFormula = initiativeFormula + `+ ${combatReflexes}`;
          break;
      }

      return initiativeFormula;
    };



    // Socket Responses - Morrslieb and opposed tests
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

    if (game.user.isGM) {
      let permissions = duplicate(game.permissions)
      if (permissions["FILES_BROWSE"].length < 4)
        permissions["FILES_BROWSE"] = [1, 2, 3, 4]
      game.settings.set("core", "permissions", permissions);
    }

    const NEEDS_MIGRATION_VERSION = "2.0.3";
    let needMigration
    try {
      needMigration = !isNewerVersion(game.settings.get("wfrp4e", "systemMigrationVersion"), NEEDS_MIGRATION_VERSION)
    }
    catch
    {
      needMigration = true;
    }
    if (needMigration && game.user.isGM) {
      new Dialog({
        title: "A Glimmer of Hope",
        content: `<p>Regarding the content wipe, I can't thank everyone enough for the emails sent to Cubicle 7. They are very supportive of implementing official modules for WFRP4e on Foundry. However, this will take time, so stay on the lookout! <br><br>Moo Man</p>`,
        buttons: {
          migrate: {
            label: "Praise Sigmar",
            callback: () => { game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version) }
          }
        }
      }).render(true)
    }
  })
}