import MarketWfrp4e from "../apps/market-wfrp4e.js";
import WFRP_Tables from "./tables-wfrp4e.js";
import ItemWfrp4e from "../item/item-wfrp4e.js";


/**
 * Provides general useful functions for various different parts of the system.
 *
 * This is basically a catch-all for useful functions that don't quite fit anywhere
 * else, but is used by many different areas of the system. Most of these functions
 * involve retrieving data from the configuration values or the compendia.
 *
 */
export default class WFRP_Utility {


  static async loadTablesPath(path) {
    let resp = await FilePicker.browse("data", path)
    let records 
    if (resp.error || !resp.target.includes("tables"))
      throw ""
    for (var file of resp.files) {
      try {
        if (!file.includes(".json"))
          continue
        let filename = file.substring(file.lastIndexOf("/") + 1, file.indexOf(".json"));

        records = await fetch(file)
        records = await records.json()
        // If extension of a table, add it to the columns
        if (records.extend && WFRP_Tables[filename] && WFRP_Tables[filename].columns) {
          WFRP_Tables[filename].columns = WFRP_Tables[filename].columns.concat(records.columns)
          WFRP_Tables[filename].rows.forEach((obj, row) => {
            for (let c of records.columns)
              WFRP_Tables[filename].rows[row].range[c] = records.rows[row].range[c]
          })
        }
        else if (records.extend && WFRP_Tables[filename] && WFRP_Tables[filename].multi) {
          WFRP_Tables[filename].multi = WFRP_Tables[filename].multi.concat(records.multi)
          WFRP_Tables[filename].rows.forEach((obj, row) => {
            for (let c of records.multi) {
              WFRP_Tables[filename].rows[row][c] = records.rows[row][c]
              WFRP_Tables[filename].rows[row].range[c] = records.rows[row].range[c]
            }
          })
        }
        else // If not extension or doesn't exist yet, load table as its filename 
          WFRP_Tables[filename] = records;
      }
      catch (error) {
        console.error("Error reading " + file + ": " + error)
      }
    }
  }

  static _keepID(id, document) {
    try {
      let compendium = !!document.pack
      let world = !compendium
      let collection

      if (compendium) {
        let pack = game.packs.get(document.pack)
        collection = pack.index
      }
      else if (world)
        collection = document.collection

      if (collection.has(id)) {
        ui.notifications.notify(`${game.i18n.format("ERROR.ID", {name: document.name})}`)
        return false
      }
      else return true
    }
    catch (e) {
      console.error(e)
      return false
    }
  }


  static propertyStringToArray(propertyString, propertyObject)
  {
      let newProperties = []
      let oldProperties = propertyString.split(",").map(i => i.trim())
      for (let property of oldProperties) {
        if (!property)
          continue
  
        let newProperty = {}
        let splitProperty = property.split(" ")
        if (Number.isNumeric(splitProperty[splitProperty.length - 1])) {
          newProperty.value = parseInt(splitProperty[splitProperty.length - 1])
          splitProperty.splice(splitProperty.length - 1, 1)
        }
  
        splitProperty = splitProperty.join(" ")
  
        newProperty.name = game.wfrp4e.utility.findKey(splitProperty, propertyObject)
        if (newProperty)
          newProperties.push(newProperty)
        else
          newProperties.push(property)
      }
      return newProperties
  }

  
  static propertyStringToObject(propertyString, propertyObject)
  {
      let array = this.propertyStringToArray(propertyString, propertyObject)
      return ItemWfrp4e._propertyArrayToObject(array, propertyObject)
  }

  /**
   * Roll characteristics given a species, or take average depending input
   * 
   * @param {string} species      Key or value for species in config
   * @param {bool} average        Take average or not
   */
  static async  speciesCharacteristics(species, average, subspecies) {
    let characteristics = {};
    let characteristicFormulae = game.wfrp4e.config.speciesCharacteristics[species];
    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].characteristics)
      characteristicFormulae = game.wfrp4e.config.subspecies[species][subspecies].characteristics

    if (!characteristicFormulae) {
      ui.notifications.info(`${game.i18n.format("ERROR.Species", { name: species })}`)
      console.log("wfrp4e | Could not find species " + species + ": " + error);
      throw error
    }


    for (let char in game.wfrp4e.config.characteristics) {
      if (average) {
        // Take average - 2d10+20 -> split on +, take the 20, add 10 (average of 2d10). This assumes, perhaps erroneously, that all species will have a 2d10 randomizer
        characteristics[char] = { value: parseInt(characteristicFormulae[char].split("+")[1]) + 10, formula: characteristicFormulae[char] }
      }
      else {
        let roll = await new Roll(characteristicFormulae[char]).roll()
        characteristics[char] = { value: roll.total, formula: characteristicFormulae[char] + ` (${roll.result})` }
      }
    }
    return characteristics
  }


  static speciesSkillsTalents(species, subspecies) {
    let skills, talents

    skills = game.wfrp4e.config.speciesSkills[species]
    talents = game.wfrp4e.config.speciesTalents[species]

    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].skills)
      skills = game.wfrp4e.config.subspecies[species][subspecies].skills

    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].talents)
      talents = game.wfrp4e.config.subspecies[species][subspecies].talents

    return { skills, talents }
  }

  /**
   * Retrieves species movement value from config.
   * 
   * @param {String} species  species key for lookup
   */
  static speciesMovement(species, subspecies) {
    let move = game.wfrp4e.config.speciesMovement[species];
    if (subspecies && game.wfrp4e.config.subspecies[species].movement)
      move = game.wfrp4e.config.subspecies[species].movement
    return move;
  }

  /**
   * Searches an object for a key that matches the given value.
   * 
   * @param {String} value  value whose key is being searched for
   * @param {Object} obj    object to be searched in
   */
  static findKey(value, obj, options = {}) {
    if (!value || !obj)
      return undefined;

    if (options.caseInsensitive) {
      for (let key in obj) {
        if (obj[key].toLowerCase() == value.toLowerCase())
          return key;
      }
    }
    else {
      for (let key in obj) {
        if (obj[key] == value)
          return key;
      }
    }
  }

  static getSystemEffects() {
    let systemEffects = duplicate(game.wfrp4e.config.systemEffects)

    Object.keys(systemEffects).map((key, index) => {
      systemEffects[key].obj = "systemEffects"
    })

    let symptomEffects = duplicate(game.wfrp4e.config.symptomEffects)
    Object.keys(symptomEffects).map((key, index) => {
      symptomEffects[key].obj = "symptomEffects"
    })

    mergeObject(systemEffects, symptomEffects)

    return systemEffects
  }

  /**
   * Specialized function to find a skill that accommodates for specializations.
   * 
   * Special considerations needs to be provided for finding skills because of specializations.
   * First, it will try to find the skill exactly, if that cannot be found, remove the specialization
   * and try to find any skill that would match if it had no specialization. If it is found, it will 
   * return that skill, renaming it to match the query.
   * 
   * For example, input could be Lore (Cheese), which doesn't exist. So it will try again testing
   * with just the skill "Lore", and trying to match it with any other skill by removing its 
   * specialization as well. Thus, lore matches with the first Lore skill, which should be 
   * the blank "Lore ()" skill. This is renamed as Lore (Cheese) and returned.
   * 
   * @param {String} skillName skill name to be searched for
   */
  static async findSkill(skillName) {
    skillName = skillName.trim();
    // First try world items
    let worldItem = game.items.contents.filter(i => i.type == "skill" && i.name == skillName)[0];
    if (worldItem) return worldItem

    let skillList = [];
    let packs = game.wfrp4e.tags.getPacksWithTag("skill")
    for (let pack of packs) {
      skillList = await pack.getIndex()
      // Search for specific skill (won't find unlisted specializations)
      let searchResult = skillList.find(s => s.name == skillName)
      if (!searchResult)
        searchResult = skillList.find(s => s.name.split("(")[0].trim() == skillName.split("(")[0].trim())

      if (searchResult) {
        let dbSkill;
        await pack.getDocument(searchResult._id).then(packSkill => dbSkill = packSkill);
        dbSkill.data.update({ name: skillName }); // This is important if a specialized skill wasn't found. Without it, <Skill ()> would be added instead of <Skill (Specialization)>
        return dbSkill;
      }
    }
    throw `"${game.i18n.format("ERROR.NoSkill", {skill: skillName})}"`

  }

  /**
   * Specialized function to find a talent that accommodates for specializations.
   * 
   * Special considerations needs to be provided for finding talents because of specializations.
   * First, it will try to find the talent exactly, if that cannot be found, remove the specialization
   * and try to find any talent that would match if it had no specialization. If it is found, it will 
   * return that talent, renaming it to match the query.
   * 
   * For example, input could be Etiquette (Cheesemongers), which doesn't exist. So it will try again testing
   * with just the talent "Etiquette", and trying to match it with any other talent by removing its 
   * specialization as well. Thus, Etiquette matches with the first Etiquette talent, which should be 
   * the blank "Etiquette ()" talent. This is renamed as Etiquette (Cheesemongers) and returned.
   * 
   * @param {String} talentName talent name to be searched for
   */
  static async findTalent(talentName) {
    talentName = talentName.trim();
    // First try world items
    let worldItem = game.items.contents.filter(i => i.type == "talent" && i.name == talentName)[0];
    if (worldItem) return worldItem

    let talentList = [];
    let packs = game.wfrp4e.tags.getPacksWithTag("talent")
    for (let pack of packs) {
      talentList = await pack.getIndex()
      // Search for specific talent (won't find unlisted specializations)
      let searchResult = talentList.find(t => t.name == talentName)
      if (!searchResult)
        searchResult = talentList.find(t => t.name.split("(")[0].trim() == talentName.split("(")[0].trim())

      if (searchResult) {
        let dbTalent;
        await pack.getDocument(searchResult._id).then(packTalent => dbTalent = packTalent);
        dbTalent.data.update({ name: talentName }); // This is important if a specialized talent wasn't found. Without it, <Talent ()> would be added instead of <Talent (Specialization)>
        return dbTalent;
      }
    }
    throw `"${game.i18n.format("ERROR.NoTalent", {talent: talentName})}"`
  }


  /**
   * 
   * @param {String} itemName   Item name to be searched for 
   * @param {String} itemType   Item's type (armour, weapon, etc.)
   * @param {String} location   Compendium to look into, format: <package.name> - "wfrp4e.trappings"
   */
  static async findItem(itemName, itemType, location = null) {
    itemName = itemName.trim();
    let items = game.items.contents.filter(i => i.type == itemType)

    // Search imported items first
    for (let i of items) {
      if (i.name == itemName && i.type == itemType)
        return i;
    }
    let itemList

    // find pack -> search pack -> return entity
    if (location) {
      let pack = game.packs.find(p => {
        location.split(".")[0] == p.metadata.package &&
          location.split(".")[1] == p.metadata.name
      })
      if (pack) {
        await pack.getIndex().then(index => itemList = index);
        let searchResult = itemList.find(t => t.name == itemName)
        if (searchResult)
          return await pack.getDocument(searchResult._id)
      }
    }

    // If all else fails, search each pack
    for (let p of game.wfrp4e.tags.getPacksWithTag(itemType)) {
      await p.getIndex().then(index => itemList = index);
      let searchResult = itemList.find(t => t.name == itemName)
      if (searchResult)
        return await p.getDocument(searchResult._id)
    }
  }

  /**
   * Gets every item of the type specified in the world and compendium packs (that have included a tag)
   * @param {String} type type of items to retrieve
   */
  static async findAll(type) {
    let items = game.items.contents.filter(i => i.type == type)

    for (let p of game.wfrp4e.tags.getPacksWithTag(type)) {
      let content = await p.getDocuments()
      items = items.concat(content.filter(i => i.data.type == type))
    }
    return items
  }


  // Used to sort arrays based on string value (used in organizing skills to be alphabetical - see ActorWfrp4e.prepareItems())
  static nameSorter(a, b) {
    if (a.name.toLowerCase() < b.name.toLowerCase())
      return -1;
    if (a.name.toLowerCase() > b.name.toLowerCase())
      return 1;
    return 0;
  }

  /**
   * Return a list of all qualities
   */
  static qualityList() {
    let weapon = duplicate(game.wfrp4e.config.weaponQualities);
    let armor = duplicate(game.wfrp4e.config.armorQualities);
    let item = duplicate(game.wfrp4e.config.itemQualities);
    let list = mergeObject(weapon, mergeObject(item, armor))
    return list;
  }


  /**
   * Return a list of all flaws
   */
  static flawList() {
    let weapon = duplicate(game.wfrp4e.config.weaponFlaws);
    let armor = duplicate(game.wfrp4e.config.armorFlaws);
    let item = duplicate(game.wfrp4e.config.itemFlaws);
    let list = mergeObject(weapon, mergeObject(item, armor))
    return list;
  }

  static allProperties() {
    return mergeObject(this.qualityList(), this.flawList())
  }

  /**
   * Looks up advancement cost based on current advancement and type.
   * 
   * @param {var} currentAdvances   Number of advances currently 
   * @param {String} type           "characteristic" or "skill"
   */
  static _calculateAdvCost(currentAdvances, type, modifier = 0) {
    let index = Math.floor(currentAdvances / 5);
    index = index < 0 ? 0 : index; // min 0

    if (index >= game.wfrp4e.config.xpCost[type].length)
      return game.wfrp4e.config.xpCost[game.wfrp4e.config.xpCost.length - 1] + modifier;
    return game.wfrp4e.config.xpCost[type][index] + modifier;
  }

  /**
   * Posts the symptom effects, then secretly posts the treatment to the GM.
   * 
   * @param {String} symptom  symptom name to be posted
   */
  static postSymptom(symptom) {
    let symkey = WFRP_Utility.findKey(symptom.split("(")[0].trim(), game.wfrp4e.config.symptoms)
    let content = `<b>${symptom}</b>: ${game.wfrp4e.config.symptomDescriptions[symkey]}`;
    let chatOptions = {
      user: game.user.id,
      rollMode: game.settings.get("core", "rollMode"),
      content: content
    };
    if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;
    ChatMessage.create(chatOptions);

    if (game.user.isGM) {
      content = `<b>${symptom} ${game.i18n.localize("Treatment")}</b>: ${game.wfrp4e.config.symptomTreatment[symkey]}`;
      chatOptions = {
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: content
      };
      chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
      ChatMessage.create(chatOptions);
    }
  }

  /**
   * Posts the definition of a quality or flaw to chat.
   * 
   * @param {String} property   name of the quality or flaw
   */
  static postProperty(property) {
    let properties = mergeObject(WFRP_Utility.qualityList(), WFRP_Utility.flawList()),
      propertyDescr = Object.assign(duplicate(game.wfrp4e.config.qualityDescriptions), game.wfrp4e.config.flawDescriptions),
      propertyKey;

    property = this.parsePropertyName(property.replace(/,/g, '').trim());

    propertyKey = WFRP_Utility.findKey(property, properties)

    let propertyDescription = `<b>${property}:</b><br>${propertyDescr[propertyKey]}`;
    propertyDescription = propertyDescription.replace("(Rating)", property.split(" ")[1])


    let chatOptions = {
      user: game.user.id,
      rollMode: game.settings.get("core", "rollMode"),
      content: propertyDescription
    };
    if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;
    ChatMessage.create(chatOptions);
  }

  /**
   * Helper function to easily find the property name
   * // Todo: regex?
   * @param {String} property 
   */
  static parsePropertyName(property) {
    property = property.trim();
    if (!isNaN(property[property.length - 1]))
      return property.substring(0, property.length - 2).trim()
    else if (property.includes("("))
      return property.split("(")[0].trim()
    else
      return property;
  }

  /**
   * Helper function to set up chat data (set roll mode and content).
   * 
   * @param {String} content 
   * @param {String} modeOverride 
   * @param {Boolean} isRoll 
   */
  static chatDataSetup(content, modeOverride, isRoll = false, forceWhisper) {
    let chatData = {
      user: game.user.id,
      rollMode: modeOverride || game.settings.get("core", "rollMode"),
      content: content
    };
    if (isRoll)
      chatData.sound = CONFIG.sounds.dice

    if (["gmroll", "blindroll"].includes(chatData.rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatData.rollMode === "blindroll") chatData["blind"] = true;
    else if (chatData.rollMode === "selfroll") chatData["whisper"] = [game.user];

    if (forceWhisper) { // Final force !
      chatData["speaker"] = ChatMessage.getSpeaker();
      chatData["whisper"] = ChatMessage.getWhisperRecipients(forceWhisper);
    }

    return chatData;
  }

  /**
   * Looks through object values and finds the one that most closely matches the query, returning the key.
   * 
   * Used by condition lookup.
   * 
   * @param {Object} Object Object being searched in
   * @param {*} query Value trying to match
   */
  static matchClosest(object, query, options = {}) {
    query = query.toLowerCase();
    let keys = Object.keys(object)
    let match = [];
    for (let key of keys) {
      let percentage = 0;
      let matchCounter = 0;
      let myword
      if (options.matchKeys)
        myword = key.toLowerCase();
      else
        myword = object[key].toLowerCase();
      for (let i = 0; i < myword.length; i++) {
        if (myword[i] == query[i]) {
          matchCounter++;
        }
      }
      percentage = matchCounter / key.length;
      match.push(percentage);
    }
    let maxIndex = match.indexOf(Math.max.apply(Math, match));
    return keys[maxIndex]
  }

  /**
   * Returns token speaker if available, otherwise, returns actor.
   * 
   * @param {Object} speaker  speaker object containing actor and otken
   */
  static getSpeaker(speaker) {
    let actor = game.actors.get(speaker.actor);
    if (speaker.token)
      actor = game.scenes.get(speaker.scene).tokens.get(speaker.token).actor
    return actor
  }

  /**
   * Returns all basic skills from the skills compendium
   */
  static async allBasicSkills() {
    let returnSkills = [];

    const packs = game.wfrp4e.tags.getPacksWithTag(["money", "skill"])

    if (!packs.length)
      return ui.notifications.error(game.i18n.localize("ERROR.Found"))

    for (let pack of packs) {
      let items
      await pack.getDocuments().then(content => items = content.filter(i => i.data.type == "skill"));
      for (let i of items) {
        if (i.data.data.advanced.value == "bsc") {
          if (i.data.data.grouped.value != "noSpec") {
            let skill = i.toObject()
            let startParen = skill.name.indexOf("(")
            skill.name = skill.name.substring(0, startParen).trim();
            if (returnSkills.filter(x => x.name.includes(skill.name)).length <= 0)
              returnSkills.push(skill);
          }
          else
            returnSkills.push(i.toObject())
        }
      }
    }
    return returnSkills;
  }

  /**
   * Returns Gold Crown, Silver Shilling, and Brass Penny from trappings compendium
   */
  static async allMoneyItems() {
    let moneyItems = []
    const packs = game.wfrp4e.tags.getPacksWithTag("money")

    if (!packs.length)
      return ui.notifications.error(game.i18n.localize("ERROR.Found"))

    for (let pack of packs) {
      let items
      await pack.getDocuments().then(content => items = content.filter(i => i.data.type == "money").map(i => i.data));

      let money = items.filter(t => Object.values(game.wfrp4e.config.moneyNames).map(n => n.toLowerCase()).includes(t.name.toLowerCase()))

      moneyItems = moneyItems.concat(money)
    }
    return moneyItems
  }

  static hasTag(pack, tag) {

  }


  static alterDifficulty(difficulty, steps) {
    let difficulties = Object.keys(game.wfrp4e.config.difficultyLabels)
    let difficultyIndex = difficulties.findIndex(d => d == difficulty) + steps
    difficultyIndex = Math.clamped(difficultyIndex, 0, difficulties.length - 1)
    return difficulties[difficultyIndex]
  }

  /**
   * Converts custom entity to clickable html element.
   * 
   * @param {String} match Entire string being converted (@Roll["1d8"])
   * @param {String} entityType Custom entity type - Roll, Table, etc
   * @param {String} id Input given in the custom link "1d8" above
   * @param {String} name Name given @Table["minormis"]{name}
   */
  static _replaceCustomLink(match, entityType, id, name) {
    let ids = id.split(",") // only used by fear/terror/exp for multiple arguments
    switch (entityType) {
      case "Roll":
        return `<a class="chat-roll" data-roll="${ids[0]}"><i class='fas fa-dice'></i> ${name ? name : id}</a>`
      case "Table":
        return `<a class = "table-click" data-table="${ids[0]}"><i class="fas fa-list"></i> ${(game.wfrp4e.tables.findTable(id)?.name && !name) ? game.wfrp4e.tables.findTable(id)?.name : name}</a>`
      case "Symptom":
        return `<a class = "symptom-tag" data-symptom="${ids[0]}"><i class='fas fa-user-injured'></i> ${name ? name : id}</a>`
      case "Condition":
        return `<a class = "condition-chat" data-cond="${ids[0]}"><i class='fas fa-user-injured'></i> ${name ? name : id}</a>`
      case "Pay":
        return `<a class = "pay-link" data-pay="${ids[0]}"><i class="fas fa-coins"></i> ${name ? name : id}</a>`
      case "Credit":
        return `<a class = "credit-link" data-credit="${ids[0]}"><i class="fas fa-coins"></i> ${name ? name : id}</a>`
      case "Corruption":
        return `<a class = "corruption-link" data-strength="${ids[0]}"><img src="systems/wfrp4e/ui/chaos.svg" height=15px width=15px style="border:none"> ${name ? name : id}</a>`
      case "Fear":
        return `<a class = "fear-link" data-value="${ids[0]}" data-name="${ids[1] || ""}"><img src="systems/wfrp4e/ui/fear.svg" height=15px width=15px style="border:none"> ${entityType} ${ids[0]}</a>`
      case "Terror":
        return `<a class = "terror-link" data-value="${ids[0]}" data-name="${ids[1] || ""}"><img src="systems/wfrp4e/ui/terror.svg" height=15px width=15px style="border:none"> ${entityType} ${ids[0]}</a>`
      case "Exp":
        return `<a class = "exp-link" data-amount="${ids[0]}" data-reason="${ids[1] || ""}"><i class="fas fa-plus"></i> ${name ? name : (ids[1] || ids[0])}</a>`
    }
  }

  /**
   * Collects data from the table click event and sends it to game.wfrp4e.tables to be rolled.
   * 
   * @param {Object} event  click event
   */
  static async handleTableClick(event) {
    let modifier = parseInt($(event.currentTarget).attr("data-modifier")) || 0;
    let html;
    let chatOptions = this.chatDataSetup("", game.settings.get("core", "rollMode"), true)

    if (event.button == 0) {
      let clickText = event.target.text || event.target.textContent;
      if (clickText.trim() == game.i18n.localize("ROLL.CritCast")) {
        html = game.wfrp4e.tables.criticalCastMenu($(event.currentTarget).attr("data-table"));
      }

      else if (clickText.trim() == game.i18n.localize("ROLL.TotalPower"))
        html = game.wfrp4e.tables.restrictedCriticalCastMenu();

      // Not really a table but whatever
      else if ($(event.currentTarget).attr("data-table") == "misfire") {
        let damage = $(event.currentTarget).attr("data-damage")
        html = game.i18n.format("ROLL.Misfire", { damage: damage });
      }
      else
        html = await game.wfrp4e.tables.formatChatRoll($(event.currentTarget).attr("data-table"),
          {
            modifier: modifier
          }, $(event.currentTarget).attr("data-column"));

      chatOptions["content"] = html;
      chatOptions["type"] = 0;
      ChatMessage.create(chatOptions);

    }

    // // If right click, open table modifier menu
    // else if (event.button == 2) {
    //   {
    //     new game.wfrp4e.apps.Wfrp4eTableSheet($(event.currentTarget).attr("data-table")).render(true)
    //   }
    // }
  }

  /**
   * Post condition when clicked.
   * 
   * @param {Object} event click event
   */
  static handleConditionClick(event) {
    let cond = $(event.currentTarget).attr("data-cond")
    if (!cond)
      cond = event.target.text.trim();
    if (!isNaN(cond.split(" ").pop())) // check if the condition level is specified
      cond = cond.split(" ").slice(0, -1).join(" ") // remove the condition level
    let condkey = WFRP_Utility.findKey(cond, game.wfrp4e.config.conditions, { caseInsensitive: true });
    let condName = game.wfrp4e.config.conditions[condkey];
    let condDescr = game.wfrp4e.config.conditionDescriptions[condkey];
    let messageContent = `<b>${condName}</b><br>${condDescr}`

    let chatData = WFRP_Utility.chatDataSetup(messageContent)
    ChatMessage.create(chatData);
  }

  /**
   * Post symptom when clicked
   * 
   * @param {Object} event click event
   */
  static handleSymptomClick(event) {
    let symptom = $(event.currentTarget).attr("data-symptom")
    if (!symptom)
      symptom = event.target.text;
    WFRP_Utility.postSymptom(symptom)
  }

  /**
   * Roll to chat when roll entity is clicked
   * 
   * @param {Object} event clicke event
   */
  static async handleRollClick(event) {
    let roll = $(event.currentTarget).attr("data-roll")
    if (!roll)
      roll = event.target.text.trim();
    let rollMode = game.settings.get("core", "rollMode");
    (await new Roll(roll).roll()).toMessage(
      {
        user: game.user.id,
        rollMode
      })
  }


  /**
 * Handle a payment entity link
 * 
 * @param {Object} event clicke event
 */
  static handlePayClick(event) {
    let payString = $(event.currentTarget).attr("data-pay")
    if (game.user.isGM)
      MarketWfrp4e.generatePayCard(payString);
  }

  static handleCreditClick(event) {
    let creditString = $(event.currentTarget).attr("data-credit")
    let amt = creditString.split(" ")[0]
    let option = creditString.split(" ")[1]
    if (game.user.isGM)
      MarketWfrp4e.generateCreditCard(amt, option);

  }

  static handleCorruptionClick(event) {
    return this.postCorruptionTest($(event.currentTarget).attr("data-strength"));
  }

  static postCorruptionTest(strength) {
    renderTemplate("systems/wfrp4e/templates/chat/corruption.html", { strength }).then(html => {
      ChatMessage.create({ content: html });
    })
  }


  static handleFearClick(event) {
    let target = $(event.currentTarget)
    return this.postFear(target.attr("data-value"), target.attr("data-name"));
  }

  static postFear(value = 0, name = undefined) {
    if (isNaN(value))
      value = 0
    let title = `${game.i18n.localize("CHAT.Fear")} ${value}`
    if (name)
      title += ` - ${name}`
    renderTemplate("systems/wfrp4e/templates/chat/fear.html", { value, name, title }).then(html => {
      ChatMessage.create({ content: html, speaker: { alias: name } });
    })
  }

  static handleTerrorClick(event) {
    let target = $(event.currentTarget)
    return this.postTerror(target.attr("data-value"), target.attr("data-name"));
  }

  static handleExpClick(event) {
    let target = $(event.currentTarget)
    return this.postExp(target.attr("data-amount"), target.attr("data-reason"));
  }

  static postTerror(value = 1, name = undefined) {
    if (isNaN(value))
      value = 1
    let title = `${game.i18n.localize("CHAT.Terror")} ${value}`
    if (name)
      title += ` - ${name}`
    renderTemplate("systems/wfrp4e/templates/chat/terror.html", { value, name, title }).then(html => {
      ChatMessage.create({ content: html, speaker: { alias: name } });
    })
  }


  static postExp(amount, reason = undefined) {
    if (isNaN(amount))
      return ui.notifications.error(game.i18n.localize("ERROR.Experience"))

    let title = `${game.i18n.localize("CHAT.Experience")}`

    renderTemplate("systems/wfrp4e/templates/chat/experience.html", { title, amount, reason }).then(html => {
      ChatMessage.create({ content: html });
    })
  }


  static _onDragConditionLink(event) {
    event.stopPropagation();
    const a = event.currentTarget;
    let dragData = null;
    dragData = { type: "condition", payload: a.dataset.cond };

    event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  static applyEffectToTarget(effect, targets) {
    if (!targets && !game.user.targets.size)
      return ui.notifications.warn(game.i18n.localize("WARNING.Target"))

    if (!targets)
      targets = game.user.targets;

    if (game.user.isGM) {
      setProperty(effect, "flags.wfrp4e.effectApplication", "")
      setProperty(effect, "flags.core.statusId", effect.label.toLowerCase())
      let msg = `${game.i18n.format("EFFECT.Applied", {name: effect.label})} `
      let actors = [];

      if (effect.flags.wfrp4e.effectTrigger == "oneTime") {
        targets.forEach(t => {
          actors.push(t.actor.data.token.name)
          game.wfrp4e.utility.applyOneTimeEffect(effect, t.actor)
        })
      }
      else {
        targets.forEach(t => {
          actors.push(t.actor.data.token.name)
          t.actor.createEmbeddedDocuments("ActiveEffect", [effect])
        })
      }
      msg += actors.join(", ");
      ui.notifications.notify(msg)
    }
    else {
      ui.notifications.notify(game.i18n.localize("APPLYREQUESTGM"))
      game.socket.emit("system.wfrp4e", { type: "applyEffects", payload: { effect, targets: [...targets].map(t => t.document.toObject()), scene: canvas.scene.id } })
    }
    game.user.updateTokenTargets([]);
  }

  /** Send effect for owner to apply, unless there isn't one or they aren't active. In that case, do it yourself */
  static applyOneTimeEffect(effect, actor) {
    if (game.user.isGM) {
      if (actor.hasPlayerOwner) {
        for (let u of game.users.contents.filter(u => u.active && !u.isGM)) {
          if (actor.data.permission.default >= CONST.DOCUMENT_PERMISSION_LEVELS.OWNER || actor.data.permission[u.id] >= CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) {
            ui.notifications.notify(game.i18n.localize("APPLYREQUESTOWNER"))
            game.socket.emit("system.wfrp4e", { type: "applyOneTimeEffect", payload: { userId: u.id, effect: effect.toObject(), actorData: actor.toObject() } })
            return
          }
        }
      }
    }
    let asyncFunction = Object.getPrototypeOf(async function () { }).constructor
    let func = new asyncFunction("args", getProperty(effect, "flags.wfrp4e.script")).bind({ actor, effect })
    func({ actor })
  }

  static invokeEffect(actor, effectId, itemId) {

    let item = actor.items.get(itemId);
    let effect = item.effects.get(effectId)

    let asyncFunction = Object.getPrototypeOf(async function () { }).constructor
    let func = new asyncFunction("args", getProperty(effect, "flags.wfrp4e.script")).bind({ actor, effect, item })
    func({actor, effect, item})
  }

  /**
   * Retrieves the item being requested by the macro from the selected actor,
   * sending it to the correct setup____ function to be rolled.
   * 
   * @param {String} itemName name of item being rolled
   * @param {String} itemType type of item ("weapon", "spell", etc)
   */
  static rollItemMacro(itemName, itemType, bypassData) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    let item
    // Not technically an item, used for convenience
    if (itemType == "characteristic") {
      return actor.setupCharacteristic(itemName, bypassData).then(setupData => {
        actor.basicTest(setupData)
      });
    }
    else {
      item = actor ? actor.getItemTypes(itemType).find(i => i.name === itemName) : null;
    }
    if (!item) return ui.notifications.warn(`${game.i18n.localize("ErrorMacroItemMissing")} ${itemName}`);

    // Trigger the item roll
    switch (item.type) {
      case "weapon":
        return actor.setupWeapon(item, bypassData).then(setupData => {
          actor.weaponTest(setupData)
        });
      case "spell":
        return actor.sheet.spellDialog(item, bypassData)
      case "prayer":
        return actor.setupPrayer(item, bypassData).then(setupData => {
          actor.prayerTest(setupData)
        });
      case "trait":
        return actor.setupTrait(item, bypassData).then(setupData => {
          actor.traitTest(setupData)
        });
      case "skill":
        return actor.setupSkill(item, bypassData).then(setupData => {
          actor.basicTest(setupData)
        });
    }
  }

  static async toggleMorrslieb() {
    let morrsliebActive = canvas.scene.getFlag("wfrp4e", "morrslieb")
    morrsliebActive = !morrsliebActive
    await canvas.scene.setFlag("wfrp4e", "morrslieb", morrsliebActive)

    if (game.modules.get("fxmaster") && game.modules.get("fxmaster").active) {
      return ui.notifications.warn("Morrslieb effect and FXMaster conflict. You must create a green effect via FXMaster manually.")
    }
    else {
      game.socket.emit("system.wfrp4e", {
        type: "morrslieb"
      })
      canvas.draw();
    }
  }


  static _packageTables() {
    let tables = {}
    let tableValues = Object.values(game.wfrp4e.tables);
    let tableKeys = Object.keys(game.wfrp4e.tables);
    tableKeys.forEach((key, index) => {
      tables[key] = tableValues[index];
    })
    return tables;
  }

  static async convertTable(tableId) {
    let table = game.tables.get(tableId)?.data
    let wfrpTable = {
      name: table.name,
      die: table.formula,
      rows: [],
    }

    for (let result of table.results) {
      wfrpTable.rows.push({
        description: result.data.text,
        range: result.data.range
      })
    }
    let file = new File([JSON.stringify(wfrpTable)], wfrpTable.name.slugify() + ".json")

    FilePicker.upload("data", `worlds/${game.world.data.name}/tables`, file)
  }

  static async convertWFRPTable(tableId) {
    let table = game.wfrp4e.tables[tableId]
    let rollTable
    if (table.columns || table.multi)
    {
      rollTable = []
      if (table.multi)
      {
        for (let column of table.multi)
        {
          let rollTableColumn = new CONFIG.RollTable.documentClass({name : table.name + " - " + column}).toObject()
          rollTableColumn["flags.wfrp4e.key"] = tableId
          rollTableColumn["flags.wfrp4e.column"] = column
          rollTableColumn.formula = table.die || "1d100"

          rollTableColumn.results = table.rows.map(i => {
            let row = duplicate(i[column])
            row.range = i.range[column]
            if (row.range.length == 1)
              row.range.push(row.range[0])
            return this._convertTableRow(row)
          })
          rollTableColumn.results = rollTableColumn.results.filter(i => i.range.length)
          rollTable.push(rollTableColumn)
        }
      }
      if (table.columns)
      {
        for (let column of table.columns)
        {
          let rollTableColumn = new CONFIG.RollTable.documentClass({name : table.name + " - " + column}).toObject()
          rollTableColumn["flags.wfrp4e.key"] = tableId
          rollTableColumn["flags.wfrp4e.column"] = column
          rollTableColumn.formula = table.die || "1d100"
          rollTableColumn.results = table.rows.map(i => {
            let row = duplicate(i)
            row.range = row.range[column]
            if (row.range.length == 1)
              row.range.push(row.range[0])
            return this._convertTableRow(row)
          })
          rollTableColumn.results = rollTableColumn.results.filter(i => i.range.length)
          rollTable.push(rollTableColumn)
        }
      }
    }
    else 
    {
      rollTable = new CONFIG.RollTable.documentClass({name : table.name}).toObject()
      rollTable["flags.wfrp4e.key"] = tableId
      rollTable.formula = table.die || "1d100"
      rollTable.results = table.rows.map(i => this._convertTableRow(i))
    }
    return RollTable.create(rollTable)
  }

  static _convertTableRow(row)
  {
    let newRow = new TableResult().toObject()
    newRow.range = row.range
    let text = ``
    if (row.name && row.description)
    {
      text += `<b>${row.name}</b>: `
      text += row.description
    }
    else if (row.name)
      text += row.name
    else if (row.description)
      text += row.description
    newRow.text = text

    return newRow
  }



  static addTablesToSidebar(html) {
    let button = $(`<button class='wfrp4e-tables'>${game.i18n.localize("WFRP4e Tables")}</button>`)

    button.click(ev => {
      ui.sidebar.activateTab("chat")
      ChatMessage.create({ content: game.wfrp4e.tables.tableMenu() })
    })

    button.insertAfter(html.find(".header-actions"))


    let tables = '<h2>WFRP4e Tables</h2>'
    // `<ol class="directory-list wfrp-table-sidebar">`

    let tableList = game.wfrp4e.tables
    let tableVisibility = game.settings.get("wfrp4e", "tableVisibility")
    for (let table of Object.keys(tableList).sort((a, b) => tableList[a].name >= tableList[b].name ? 1 : -1)) {
      if (game.user.isGM || tableVisibility[table])
        tables += `<li class='directory-item wfrp-table' style='display: flex;'><a class="wfrp-table-click" data-table='${table}'>${tableList[table].name}</a></li>`
    }

    if (html.find(".directory-list").children().length)
      $(tables).insertAfter(html.find(".directory-list")[0].lastChild)
    else
      html.find(".directory-list").append(tables)


    html.find(".wfrp-table-click").mousedown(ev => {
      let table = ev.target.dataset.table
      if (ev.button == 0) {
        game.wfrp4e.tables.rollToChat(table)
      }
      else if (ev.button == 2) {
        let tableObject = duplicate(game.wfrp4e.tables[table])
        tableObject.key = table
        new game.wfrp4e.apps.Wfrp4eTableSheet(tableObject).render(true)
      }
    })
  }

  /*
  * Checks that the selected advancement can be afforded by the actor
  *
  * @param {Integer} total: the xp total for the actor
  * @param {Integer} spent: the spent xp plus cost
  * @param {String} action: the action, buy or improve for example
  * @param {String} item: the title of the skill, talent or characteristic
  */
  static checkValidAdvancement(total, spent, action, item) {
    if(total - spent < 0) {
       throw new Error(game.i18n.format("ACTOR.AdvancementError", { action: action, item: item }));
    }
  }




  //@HOUSE
  static optimalDifference(weapon, range)
  {
    let keys = Object.keys(game.wfrp4e.config.rangeBands)
    let rangeKey = this.findKey(range, game.wfrp4e.config.rangeBands)
    let weaponRange = weapon.getFlag("wfrp4e", "optimalRange")
    if (!weaponRange || !rangeKey)
      return 1
    
    return Math.abs(keys.findIndex(i => i == rangeKey) - keys.findIndex(i => i == weaponRange))
  }
  //@/HOUSE



  static log(message) {
    console.log(`%cWFRP4e` + `%c | ${message}`, "color: gold", "color: unset");
  }

  
  static logHomebrew(message) {
    this.log("Applying Homebrew Rule: " + message)
  }

}


Hooks.on("renderFilePicker", (app, html, data) => {
  if (data.target.includes("systems") || data.target.includes("modules")) {
    html.find("input[name='upload']").css("display", "none")
    let label = html.find(".upload-file label")
    label.text("Upload Disabled");
    label.attr("title", "Upload disabled while in system directory. DO NOT put your assets within any system or module folder.");
  }
})  
