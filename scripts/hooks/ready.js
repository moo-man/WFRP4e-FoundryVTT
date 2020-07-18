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

  TextEditor._replaceCustomLink = function(match, entityType, id, name) {
    const a = document.createElement('a');
    a.draggable = false;
    switch (entityType)
    {
      case "Roll":
        a.classList.add("chat-roll");
        a.dataset['roll'] = id;
        a.innerHTML = `<i class="fas fa-dice"></i> ${name ? name : id}`;
        break;
        //return `<a class="chat-roll" data-roll="${id}"><i class='fas fa-dice'></i> ${name ? name : id}</a>`
      case "Table":
        a.classList.add("table-click");
        a.dataset['table'] = id;
        a.innerHTML = `<i class="fas fa-list"></i> ${(WFRP_Tables[id] && !name) ? WFRP_Tables[id].name : name}`;
        break;
        //return `<a class = "table-click" data-table="${id}"><i class="fas fa-list"></i> ${(WFRP_Tables[id] && !name) ? WFRP_Tables[id].name : name}</a>`
      case "Symptom":
        a.classList.add("symptom-tag");
        a.draggable = true;
        a.dataset['symptom'] = id;
        a.innerHTML = `<i class='fas fa-user-injured'></i> ${name ? name : id}`;
        break;
        //return `<a class = "symptom-tag" data-symptom="${id}"><i class='fas fa-user-injured'></i> ${name ? name : id}</a>`
      case "Condition":
        a.classList.add("condition-chat");
        a.draggable = true;
        a.dataset['cond'] = id;
        a.innerHTML = `<i class='fas fa-user-injured'></i> ${name ? name : id}`;
        break;
        //return `<a class = "condition-chat" data-cond="${id}"><i class='fas fa-user-injured'></i> ${name ? name : id}</a>`
      case "Pay":
        a.classList.add("pay-link");
        a.dataset['pay'] = id;
        a.innerHTML = `<i class="fas fa-coins"></i> ${name ? name : id}`;
        //return `<a class = "pay-link" data-pay="${id}"><i class="fas fa-coins"></i> ${name ? name : id}</a>`
        break;
    }    
    return a;
  }

  TextEditor.enrichHTML = function(content, {secrets=false, entities=true, links=true, rolls=true}={}) {

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
      const entityTypes = CONST.ENTITY_LINK_TYPES.concat("Compendium");
      const rgx = new RegExp(`@(${entityTypes.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`, 'g');
      updateTextArray = this._replaceTextContent(text, rgx, this._createEntityLink);

      if ( updateTextArray ) text = this._getTextNodes(html);
      const pseudoTypes = PSEUDO_ENTITIES;
      const rgx2 = new RegExp(`@(${pseudoTypes.join("|")})\\[([^\\]]+)\\](?:{([^}]+)})?`, 'g');
      updateTextArray = this._replaceTextContent(text, rgx2, this._replaceCustomLink);      
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
      const rgx = /\[\[(\/[a-zA-Z]+\s)?([^\]]+)\]\]/gi;
      updateTextArray = this._replaceTextContent(text, rgx, (...args) => this._createInlineRoll(...args, rollData));
    }

    // Return the enriched HTML
    return html.innerHTML;
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

 const NEEDS_MIGRATION_VERSION = "1.6.2";
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
    title: "The End Times",
    content: `<p>Regretfully, Ranald's Blessing has run dry and 2.0 loses more than it gains.<br><br>All compendia, tables, icons, tokens, have been stripped due to the higher scrutiny towards the system.<br><br>But all is not lost, all the mechanics remain, and the same level of automation can still be achieved. I hope this doesn't ruin the premium experience Foundry offers for Warhammer Fantasy 4e. <br><br> Please contact me if you need assistance in creating items that the system can recognize and provide automation with.<br><br>- Moo Man<br><br>PS. If you feel as I do and want to see an open avenue to include the 4e content officially, perhaps respectably reach out to Cubicle 7 and describe how important Foundry and the Warhammer system are to you. Please be amicable.</p>`,
    buttons: {
      migrate: {
        label : "Sigmar Endures",
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
