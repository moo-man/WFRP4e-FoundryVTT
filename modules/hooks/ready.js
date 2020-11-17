import WFRP_Utility from "../system/utility-wfrp4e.js";

import WFRP_Tables from "../system/tables-wfrp4e.js";

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

    // ***** FVTT functions with slight modification to include pseudo entities *****

  /**
   * Enrich HTML content by replacing or augmenting components of it
   * @param {string} content        The original HTML content (as a string)
   * @param {boolean} secrets       Include secret tags in the final HTML? If false secret blocks will be removed.
   * @param {boolean} entities      Replace dynamic entity links?
   * @param {boolean} links         Replace hyperlink content?
   * @param {boolean} rolls         Replace inline dice rolls?
   * @param {Object} rollData       The data object providing context for inline rolls
   * @return {string}               The enriched HTML content
   */
  TextEditor.enrichHTML = function(content, {secrets=false, entities=true, links=true, rolls=true, rollData=null}={}){

    // Create the HTML element
    const html = document.createElement("div");
    html.innerHTML = String(content);

    // Remove secret blocks
    if ( !secrets ) {
      let elements = html.querySelectorAll("section.secret");
      elements.forEach(e => e.parentNode.removeChild(e));
    }

    // Plan text content replacements
    let updateTextArray = true;
    let text = [];

    // Replace entity links
    if ( entities ) {
      if ( updateTextArray ) text = this._getTextNodes(html);
      const entityTypes = CONST.ENTITY_LINK_TYPES.concat("Compendium").concat(game.wfrp4e.config.PSEUDO_ENTITIES);
      const rgx = new RegExp(`@(${entityTypes.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`, 'g');
      updateTextArray = this._replaceTextContent(text, rgx, this._createEntityLink);
    }

    // Replace hyperlinks
    if ( links ) {
      if ( updateTextArray ) text = this._getTextNodes(html);
      const rgx = /(https?:\/\/)(www\.)?([^\s<]+)/gi;
      updateTextArray = this._replaceTextContent(text, rgx, this._createHyperlink);
    }

    // Replace inline rolls
    if ( rolls ) {
      if (updateTextArray) text = this._getTextNodes(html);
      const rgx = /\[\[(\/[a-zA-Z]+\s)?(.*?)([\]]{2,3})/gi;
      updateTextArray = this._replaceTextContent(text, rgx, (...args) => this._createInlineRoll(...args, rollData));
    }

    // Return the enriched HTML
    return html.innerHTML;
  };

  /**
   * Create a dynamic entity link from a regular expression match
   * @param {string} match          The full matched string
   * @param {string} type           The matched entity type or "Compendium"
   * @param {string} target         The requested match target (_id or name)
   * @param {string} name           A customized or over-ridden display name for the link
   * @return {HTMLAnchorElement}    An HTML element for the entity link
   * @private
   */
  TextEditor._createEntityLink = function(match, type, target, name) {

    // Prepare replacement data
    const data = {
      cls: ["entity-link"],
      icon: null,
      dataset: {},
      name: name
    };
    let broken = false;

    // Get a matched World entity
    if (CONST.ENTITY_TYPES.includes(type)) {
      const config = CONFIG[type];

      // Get the linked Entity
      const collection = config.entityClass.collection;
      const entity = /^[a-zA-Z0-9]{16}$/.test(target) ? collection.get(target) : collection.getName(target);
      if (!entity) broken = true;

      // Update link data
      data.name = data.name || (broken ? target : entity.name);
      data.icon = config.sidebarIcon;
      data.dataset = {entity: type, id: broken ? null : entity.id};
    }

    // Get a matched Compendium entity
    else if (type === "Compendium") {

      // Get the linked Entity
      let [scope, packName, id] = target.split(".");
      const pack = game.packs.get(`${scope}.${packName}`);
      if ( pack ) {
        if (pack.index.length) {
          const entry = pack.index.find(i => (i._id === id) || (i.name === id));
          if (!entry) broken = true;
          else id = entry._id;
          data.name = data.name || entry.name || id;
        }

        // Update link data
        const config = CONFIG[pack.metadata.entity];
        data.icon = config.sidebarIcon;
        data.dataset = {pack: pack.collection, id: id};
      }
      else broken = true;
    }
    else if (game.wfrp4e.config.PSEUDO_ENTITIES.includes(type))
    {
      const a = document.createElement('a');
      a.innerHTML = WFRP_Utility._replaceCustomLink(match, type, target, name)
       return a;
    }

    // Flag a link as broken
    if (broken) {
      data.icon = "fas fa-unlink";
      data.cls.push("broken");
    }

    // Construct the formed link
    const a = document.createElement('a');
    a.classList.add(...data.cls);
    a.draggable = true;
    for (let [k, v] of Object.entries(data.dataset)) {
      a.dataset[k] = v;
    }
    a.innerHTML = `<i class="${data.icon}"></i> ${data.name}`;
    return a;
  }

    // Modify the initiative formula depending on whether the actor has ranks in the Combat Reflexes talent
    Combat.prototype._getInitiativeFormula = function (combatant) {
      const actor = combatant.actor;
      let initiativeFormula = CONFIG.Combat.initiative.formula || game.system.data.initiative;
      let initiativeSetting = game.settings.get("wfrp4e", "initiativeRule")

      if (!actor) return initiativeFormula;
      let combatReflexes = 0;
      let mindless = false;
      for (let item of actor.items) {
        if (item.type == "talent" && item.data.name == game.i18n.localize("NAME.CombatReflexes"))
          combatReflexes += item.data.data.advances.value;
        if (item.type == "trait" && item.data.name == game.i18n.localize("NAME.Mindless"))
          mindless = true;
      }

      if (mindless) return "-10"
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

    // const NEEDS_MIGRATION_VERSION = "2.0.3";
    // let needMigration
    // try {
    //   needMigration = !isNewerVersion(game.settings.get("wfrp4e", "systemMigrationVersion"), NEEDS_MIGRATION_VERSION)
    // }
    // catch
    // {
    //   needMigration = true;
    // }
    // if (needMigration && game.user.isGM) {
    //   new Dialog({
    //     title: "A Glimmer of Hope",
    //     content: `<p>Regarding the content wipe, I can't thank everyone enough for the emails sent to Cubicle 7. They are very supportive of implementing official modules for WFRP4e on Foundry. However, this will take time, so stay on the lookout! <br><br>Moo Man</p>`,
    //     buttons: {
    //       migrate: {
    //         label: "Praise Sigmar",
    //         callback: () => { game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version) }
    //       }
    //     }
    //   }).render(true)
    // }
  })
}