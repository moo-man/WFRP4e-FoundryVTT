/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */
Hooks.on("ready", async () => {

    // Localize strings in the WFRP4E object
    for (let obj in WFRP4E)
    {
      for (let el in WFRP4E[obj])
      {
        if (typeof WFRP4E[obj][el] === "string")
        {
          WFRP4E[obj][el] = game.i18n.localize(WFRP4E[obj][el])
        }
      }
    }
  
    let activeModules = game.settings.get("core", "moduleConfiguration");
   
    // Load module tables if the module is active and if the module has tables
     for (let m in activeModules)
     {
       let module;
       if (activeModules[m])
       {
        
          try{
          await FilePicker.browse("data", `modules/${m}/tables`).then(resp => {

           if (resp.error || !resp.target.includes("tables"))
             throw ""
           for (var file of resp.files)
           {
             try {
               if (!file.includes(".json"))
                 continue
               let filename = file.substring(file.lastIndexOf("/")+1, file.indexOf(".json"));
   
               fetch(file).then(r=>r.json()).then(async records => {
                // If extension of a table, add it to the columns
                if(records.extend && WFRP_Tables[filename])
                {
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
             catch(error) {
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
      try 
      {
      if (resp.error || !resp.target.includes("tables"))
        throw ""
      for (var file of resp.files)
      {
        try {
          if (!file.includes(".json"))
            continue
          let filename = file.substring(file.lastIndexOf("/")+1, file.indexOf(".json"));

          fetch(file).then(r=>r.json()).then(async records => {
            // If extension of a table, add it to the columns
            if(records.extend && WFRP_Tables[filename])
            {
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
        catch(error) {
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

  if(game.settings.get('wfrp4e', 'customCursor')){
    console.log('wfrp4e | Using custom cursor')
    let link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet')
    link.type = 'text/css'
    link.href = '/systems/wfrp4e/css/cursor.css'

    document.head.appendChild(link);
  }

  // ***** FVTT functions with slight modification to include pseudo entities *****

//  TextEditor._replaceContentLinks = function(match, entityType, id, name){

//     // Match Compendium content
//     if ( entityType === "Compendium" ) {
//       return this._replaceCompendiumLink(match, id, name);
//     }

//     else if (PSEUDO_ENTITIES.includes(entityType))
//     {
//       return WFRP_Utility._replaceCustomLink(match, entityType, id, name)
//     }

//     // Match World content
//     else {
//       return this._replaceEntityLink(match, entityType, id, name);
//     }
//   }

//  TextEditor.enrichHTML = function(content, {secrets=false, entities=true, links=true, rolls=true}={}) {
//   let html = document.createElement("div");
//   html.innerHTML = content;

//   // Strip secrets
//   if ( !secrets ) {
//     let elements = html.querySelectorAll("section.secret");
//     elements.forEach(e => e.parentNode.removeChild(e));
//   }

//   // Match content links
//   if ( entities ) {
//     const entityTypes = CONST.ENTITY_LINK_TYPES.concat("Compendium").concat(PSEUDO_ENTITIES);;
//     const entityMatchRgx = `@(${entityTypes.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`;
//     const rgx = new RegExp(entityMatchRgx, 'g');

//     // Find and preload compendium indices
//     const matches = Array.from(html.innerHTML.matchAll(rgx));
//     if ( matches.length ) this._preloadCompendiumIndices(matches);

//     // Replace content links
//     html.innerHTML = html.innerHTML.replace(rgx, this._replaceContentLinks.bind(this));
//   }

//   // Replace hyperlinks
//   if ( links ) {
//     let rgx = /(?:[^\S]|^)((?:(?:https?:\/\/)|(?:www\.))(?:\S+))/gi;
//     html.innerHTML = html.innerHTML.replace(rgx, this._replaceHyperlinks);
//   }

//   // Process inline dice rolls
//   if ( rolls ) {
//     const rgx = /\[\[(\/[a-zA-Z]+\s)?([^\]]+)\]\]/gi;
//     html.innerHTML = html.innerHTML.replace(rgx, this._replaceInlineRolls);
//   }

//   // Return the enriched HTML
//   return html.innerHTML;
// };


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
      const entityTypes = CONST.ENTITY_LINK_TYPES.concat("Compendium").concat(PSEUDO_ENTITIES);
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
    else if (PSEUDO_ENTITIES.includes(type))
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
Combat.prototype._getInitiativeFormula = function(combatant) {
  const actor = combatant.actor;
  let initiativeFormula = CONFIG.Combat.initiative.formula || game.system.data.initiative;
  let initiativeSetting = game.settings.get("wfrp4e", "initiativeRule")

  if ( !actor ) return initiativeFormula;
  let combatReflexes = 0;
  for (let item of actor.items)
  {
    if (item.type == "talent" && item.data.name == game.i18n.localize("NAME.CombatReflexes"))
      combatReflexes += item.data.data.advances.value;
  }

  if (!combatReflexes) return initiativeFormula

  switch (initiativeSetting)
  {
    case "default":
      initiativeFormula = initiativeFormula + `+ ${combatReflexes * 10}`;
    break;

    case "sl":
    initiativeFormula = `(floor((@characteristics.i.value + ${combatReflexes * 10})/ 10) - floor(1d100/10))`
    break;

    case "d10Init":
    initiativeFormula = initiativeFormula + `+ ${combatReflexes*10}`;
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

  else if (data.type == "target" && game.user.isGM)
  {
    let scene = game.scenes.get(data.payload.scene)
    let token = new Token(scene.getEmbeddedEntity("Token", data.payload.target))
    token.actor.update(
    {
      "flags.oppose": data.payload.opposeFlag
    })
  }
 })

 if (game.user.isGM)
 {
   let permissions = duplicate(game.permissions)
   if (permissions["FILES_BROWSE"].length < 4)
   permissions["FILES_BROWSE"] = [1, 2, 3, 4]
   game.settings.set("core", "permissions", permissions);
 }

 const NEEDS_MIGRATION_VERSION = "2.0.3";
 let needMigration
 try 
 {
  needMigration = !isNewerVersion(game.settings.get("wfrp4e", "systemMigrationVersion"), NEEDS_MIGRATION_VERSION)
 }
 catch 
 {
  needMigration = true;
 }
 if (needMigration && game.user.isGM ) 
 {
  new Dialog({
    title: "Where's all the data?",
    content: `<p><b>PLEASE READ</b><br><br>If you're wondering where all the content in the compendium is, I removed it due to copyright concerns. Luckily, C7 and I are working together to bring it back officially, and better than ever. Please watch Discord or C7's Website to be informed when it will be released. <br><br>Thanks to everyone for their support, and if you're just now joining the Foundry community, I apologize if this may come as a surprise to you, leaving you disappointed.<br><br>However, the Foundry Discord or the Rat Catchers' Guild is a great place to ask questions and help get your game up and running in the meantime. I can assure you that the new and improved official modules will be well worth it.<br><br>Moo Man</p>`,
    buttons: {
      migrate: {
        label : "Praise Sigmar",
        callback : () => {game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version)}
      }
    }
  }).render(true)
}

Hooks.on("closePermissionConfig", () => {
  if (game.permissions["FILES_BROWSE"].length < 4)
  {
      ui.notifications.warn("WARNING: WFRP4E currently requires users to have \"Browse File Explorer\" Permission", {permanent: true})
      return
  }
})

Hooks.once('diceSoNiceReady', (dice3d) => {
  dice3d.addSystem({id:"wfrp-black",name:"WFRP Black"},false);
  dice3d.addSystem({id:"wfrp-white",name:"WFRP White"},false);
  dice3d.addSystem({id:"wfrp-red",name:"WFRP Red"},false);
  dice3d.addDicePreset({
    type:"d10",
    labels:[
      'systems/wfrp4e/ui/dices/black/d10-1.png', 
      'systems/wfrp4e/ui/dices/black/d10-2.png', 
      'systems/wfrp4e/ui/dices/black/d10-3.png', 
      'systems/wfrp4e/ui/dices/black/d10-4.png', 
      'systems/wfrp4e/ui/dices/black/d10-5.png', 
      'systems/wfrp4e/ui/dices/black/d10-6.png', 
      'systems/wfrp4e/ui/dices/black/d10-7.png', 
      'systems/wfrp4e/ui/dices/black/d10-8.png', 
      'systems/wfrp4e/ui/dices/black/d10-9.png', 
      'systems/wfrp4e/ui/dices/black/d10-0.png'
    ],
    bumpMaps:[
      'systems/wfrp4e/ui/dices/normals/d10-1.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-2.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-3.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-4.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-5.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-6.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-7.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-8.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-9.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-0.jpg'
    ],
    system:"wfrp-black"
  });

  dice3d.addDicePreset({
    type:"d10",
    labels:[
      'systems/wfrp4e/ui/dices/white/d10-1.png', 
      'systems/wfrp4e/ui/dices/white/d10-2.png', 
      'systems/wfrp4e/ui/dices/white/d10-3.png', 
      'systems/wfrp4e/ui/dices/white/d10-4.png', 
      'systems/wfrp4e/ui/dices/white/d10-5.png', 
      'systems/wfrp4e/ui/dices/white/d10-6.png', 
      'systems/wfrp4e/ui/dices/white/d10-7.png', 
      'systems/wfrp4e/ui/dices/white/d10-8.png', 
      'systems/wfrp4e/ui/dices/white/d10-9.png', 
      'systems/wfrp4e/ui/dices/white/d10-0.png'
    ],
    bumpMaps:[
      'systems/wfrp4e/ui/dices/normals/d10-1.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-2.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-3.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-4.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-5.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-6.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-7.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-8.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-9.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-0.jpg'
    ],
    system:"wfrp-white"
  });

  dice3d.addDicePreset({
    type:"d10",
    labels:[
      'systems/wfrp4e/ui/dices/red/d10-1.png', 
      'systems/wfrp4e/ui/dices/red/d10-2.png', 
      'systems/wfrp4e/ui/dices/red/d10-3.png', 
      'systems/wfrp4e/ui/dices/red/d10-4.png', 
      'systems/wfrp4e/ui/dices/red/d10-5.png', 
      'systems/wfrp4e/ui/dices/red/d10-6.png', 
      'systems/wfrp4e/ui/dices/red/d10-7.png', 
      'systems/wfrp4e/ui/dices/red/d10-8.png', 
      'systems/wfrp4e/ui/dices/red/d10-9.png', 
      'systems/wfrp4e/ui/dices/red/d10-0.png'
    ],
    bumpMaps:[
      'systems/wfrp4e/ui/dices/normals/d10-1.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-2.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-3.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-4.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-5.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-6.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-7.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-8.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-9.jpg', 
      'systems/wfrp4e/ui/dices/normals/d10-0.jpg'
    ],
    system:"wfrp-red"
  });

  dice3d.addDicePreset({
    type:"d100",
    labels:[
      'systems/wfrp4e/ui/dices/black/d100-10.png', 
      'systems/wfrp4e/ui/dices/black/d100-20.png', 
      'systems/wfrp4e/ui/dices/black/d100-30.png', 
      'systems/wfrp4e/ui/dices/black/d100-40.png', 
      'systems/wfrp4e/ui/dices/black/d100-50.png', 
      'systems/wfrp4e/ui/dices/black/d100-60.png', 
      'systems/wfrp4e/ui/dices/black/d100-70.png', 
      'systems/wfrp4e/ui/dices/black/d100-80.png', 
      'systems/wfrp4e/ui/dices/black/d100-90.png', 
      'systems/wfrp4e/ui/dices/black/d100-00.png'
    ],
    bumpMaps:[
      'systems/wfrp4e/ui/dices/normals/d100-10.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-20.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-30.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-40.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-50.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-60.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-70.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-80.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-90.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-00.jpg'
    ],
    system:"wfrp-black"
  });

  dice3d.addDicePreset({
    type:"d100",
    labels:[
      'systems/wfrp4e/ui/dices/white/d100-10.png', 
      'systems/wfrp4e/ui/dices/white/d100-20.png', 
      'systems/wfrp4e/ui/dices/white/d100-30.png', 
      'systems/wfrp4e/ui/dices/white/d100-40.png', 
      'systems/wfrp4e/ui/dices/white/d100-50.png', 
      'systems/wfrp4e/ui/dices/white/d100-60.png', 
      'systems/wfrp4e/ui/dices/white/d100-70.png', 
      'systems/wfrp4e/ui/dices/white/d100-80.png', 
      'systems/wfrp4e/ui/dices/white/d100-90.png', 
      'systems/wfrp4e/ui/dices/white/d100-00.png'
    ],
    bumpMaps:[
      'systems/wfrp4e/ui/dices/normals/d100-10.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-20.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-30.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-40.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-50.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-60.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-70.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-80.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-90.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-00.jpg'
    ],
    system:"wfrp-white"
  });

  dice3d.addDicePreset({
    type:"d100",
    labels:[
      'systems/wfrp4e/ui/dices/red/d100-10.png', 
      'systems/wfrp4e/ui/dices/red/d100-20.png', 
      'systems/wfrp4e/ui/dices/red/d100-30.png', 
      'systems/wfrp4e/ui/dices/red/d100-40.png', 
      'systems/wfrp4e/ui/dices/red/d100-50.png', 
      'systems/wfrp4e/ui/dices/red/d100-60.png', 
      'systems/wfrp4e/ui/dices/red/d100-70.png', 
      'systems/wfrp4e/ui/dices/red/d100-80.png', 
      'systems/wfrp4e/ui/dices/red/d100-90.png', 
      'systems/wfrp4e/ui/dices/red/d100-00.png'
    ],
    bumpMaps:[
      'systems/wfrp4e/ui/dices/normals/d100-10.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-20.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-30.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-40.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-50.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-60.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-70.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-80.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-90.jpg', 
      'systems/wfrp4e/ui/dices/normals/d100-00.jpg'
    ],
    system:"wfrp-red"
  });

});
});