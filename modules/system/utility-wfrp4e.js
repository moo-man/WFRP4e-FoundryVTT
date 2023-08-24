import MarketWfrp4e from "../apps/market-wfrp4e.js";
import WFRP_Tables from "./tables-wfrp4e.js";
import ItemWfrp4e from "../item/item-wfrp4e.js";
import ChatWFRP from "./chat-wfrp4e.js";
import ItemDialog from "../apps/item-dialog.js";
import TestWFRP from "../system/rolls/test-wfrp4e.js";


/**
 * Provides general useful functions for various different parts of the system.
 *
 * This is basically a catch-all for useful functions that don't quite fit anywhere
 * else, but is used by many different areas of the system. Most of these functions
 * involve retrieving data from the configuration values or the compendia.
 *
 */
export default class WFRP_Utility {

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
      WFRP_Utility.log("Could not find species " + species + ": " + error, true);
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

  static find(name, type)
  {
    if (type == "skill")
      return game.wfrp4e.utility.findSkill(name)
    if (type == "talent")
      return game.wfrp4e.utility.findTalent(name)
    else 
      return game.wfrp4e.utility.findItem(name, type)
  }

  
  static findItemId(id, type) {
    if (id.includes("."))
      return fromUuid(id);

    if (game.items.has(id))
      return game.items.get(id)

    let packs = game.wfrp4e.tags.getPacksWithTag(type)
    for (let pack of packs) {
      if (pack.index.has(id)) {
        return pack.getDocument(id)
      }
    }
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
    // First try world items
    let worldItem = await WFRP_Utility._findBaseName(skillName, game.items)
    if (worldItem) return worldItem

    let packs = game.wfrp4e.tags.getPacksWithTag("skill")
    for (let pack of packs) {
      let index = pack.indexed ? pack.index : await pack.getIndex();
      
      let item = await WFRP_Utility._findBaseName(skillName, index, pack)
      if (item) 
        return item
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
    // First try world items
    let worldItem = await WFRP_Utility._findBaseName(talentName, game.items)
    if (worldItem) return worldItem

    let packs = game.wfrp4e.tags.getPacksWithTag("talent")
    for (let pack of packs) {
      let index = pack.indexed ? pack.index : await pack.getIndex();

      let item = await WFRP_Utility._findBaseName(talentName, index, pack)
      if (item) 
        return item
    }
    throw `"${game.i18n.format("ERROR.NoTalent", {talent: talentName})}"`
  }


  /**
   * Finds an item with the same base name (Prejudice (Target) == Prejudice (Nobles)).
   * 
   * @param {String} name item name to be searched for
   * @param {Collection} collection collection to search in, could be a world collection or pack index
   * @param {String} pack if collection is a pack index, include the pack to retrieve the document
   * 
   */
  static async _findBaseName(name, collection, pack)
  {
    name = name.trim();
    let searchResult = collection.find(t => t.name == name)
    if (!searchResult)
      searchResult = collection.find(t => t.name.split("(")[0].trim() == name.split("(")[0].trim())

    if (searchResult) {
      let item
      if (pack) // If compendium pack
        item = await pack.getDocument(searchResult._id)
      else // World Item
      {
        item = searchResult.clone()
      }

      item.updateSource({ name }); // This is important if a specialized talent wasn't found. Without it, <Talent ()> would be added instead of <Talent (Specialization)>
      return item;
    }
  }


  /**
   * 
   * @param {String} itemName   Item name to be searched for 
   * @param {String|Array} itemType   Item's type (armour, weapon, etc.)
   */
  static async findItem(itemName, itemType) {
    itemName = itemName.trim();
    if (typeof itemType == "string")
    {
      itemType = [itemType];
    }

    let items
    if (itemType?.length)
      items = game.items.contents.filter(i => itemType.includes(i.type))
    else 
      items = game.items.contents

    // Search imported items first
    for (let i of items) {
      if (i.name == itemName)
        return i;
    }
    let itemList

    // If all else fails, search each pack
    for (let pack of game.wfrp4e.tags.getPacksWithTag(itemType)) {
      const index = pack.indexed ? pack.index : await pack.getIndex();
      itemList = index
      let searchResult = itemList.find(t => t.name == itemName && (!itemType?.length || itemType?.includes(t.type))) // if type is specified, check, otherwise it doesn't matter
      if (searchResult)
        return await pack.getDocument(searchResult._id)
    }
  }

  /**
   * Gets every item of the type specified in the world and compendium packs (that have included a tag)
   * @param {String} type type of items to retrieve
   */
  static async findAll(type, loadingLabel = "") {
    let items = game.items.contents.filter(i => i.type == type)

    let packCounter = 0
    let packs = game.wfrp4e.tags.getPacksWithTag(type)
    for (let p of packs) {
      if (loadingLabel)
      {
        packCounter++
        SceneNavigation.displayProgressBar({label: loadingLabel, pct: (packCounter / packs.length)*100 })
      }
      let content = await p.getDocuments()
      items = items.concat(content.filter(i => i.type == type))
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
   * @param {Number} currentAdvances   Number of advances currently
   * @param {String} type              "characteristic" or "skill"
   * @param {Number} modifier          Cost modifier per advancement
   */
  static _calculateAdvCost(currentAdvances, type, modifier = 0) {
    let index = Math.floor(currentAdvances / 5);
    index = index < 0 ? 0 : index; // min 0

    if (index >= game.wfrp4e.config.xpCost[type].length)
      return game.wfrp4e.config.xpCost[type][game.wfrp4e.config.xpCost[type].length - 1] + modifier;
    return game.wfrp4e.config.xpCost[type][index] + modifier;
  }

  /**
   * Looks up a bulk advancement cost based on current advancement and type.
   *
   * @param {Number} start        Number of current advances
   * @param {Number} end          Target number of advances
   * @param {String} type         "characteristic" or "skill"
   * @param {Number} modifier     Cost modifier of the skill
   */
  static _calculateAdvRangeCost(start, end, type, modifier = 0) {
    let cost = 0

    let multiplier = 1

    // If reverse advance, multiply by -1 to grant XP back
    if (end < start) {
      multiplier = -1
      let temp = end
      end = start
      start = temp;
    }

    while (start < end) {
      cost += this._calculateAdvCost(start, type, modifier)
      start++;
    }
    return cost * multiplier
  }

  static advancementDialog(item, advances, type, actor)
  {
    let start = item instanceof Item ? item.advances.value : actor.characteristics[item].advances
    let end = advances;
    let name = item instanceof Item ? item.name : game.wfrp4e.config.characteristics[item]

    let career = false;
    try 
    {

      if (item instanceof Item)
      {
        let currentCareer = actor.currentCareer
        if (currentCareer.system.skills.find(i => i == item.name))
        {
          career = true;
        }
      }
      else 
      {
        career = actor.system.characteristics[item].career
      }
    }
    catch(e)
    {
      career = false;
    }
    return new Promise(resolve => {
      let xp = this._calculateAdvRangeCost(start, end, type, item.advances?.costModifier)
      if (!career)
      {
        xp *= 2;
      }
      if (xp) {
        new Dialog({
          title: game.i18n.localize("DIALOG.Advancement"),
          content: 
          `
          <p>${game.i18n.localize("DIALOG.AdvancementContent")}</p>
          <div class="form-group">
          <input type="number" value=${xp}>
          </div>
          `,
          buttons: {
            ok: {
              label: game.i18n.localize("Ok"),
              callback: async (dlg) => {
                xp = Number(dlg.find("input")[0]?.value) || xp
                if (xp != 0)
                {
                  try {

                    let newSpent = actor.details.experience.spent + xp
                    WFRP_Utility.checkValidAdvancement(actor.details.experience.total, newSpent, game.i18n.localize("ACTOR.ErrorImprove"), name);
                    let log = actor._addToExpLog(xp, `${name} (${end-start})`, newSpent)
                    actor.update({ "system.details.experience.spent": newSpent, "system.details.experience.log": log })
                    resolve(true)
                  }
                  catch (e)
                  {
                    ui.notifications.error(e)
                    resolve(false)
                  }
                }
              }
            },
            free: {
              label: game.i18n.localize("Free"),
              callback: () => { resolve(true) }
            }
          },
          close : () => {resolve(false)}
        }).render(true)
      }
      else resolve(true)
    })
  }

  static memorizeCostDialog(spell, actor) {
    return new Promise(resolve => {
      let xp = this.calculateSpellCost(spell, actor)
      if (xp) {
        new Dialog({
          title: game.i18n.localize("DIALOG.MemorizeSpell"),
          content: `<p>${game.i18n.format("DIALOG.MemorizeSpellContent", { xp })}</p>`,
          buttons: {
            ok: {
              label: game.i18n.localize("Ok"),
              callback: () => {
                let newSpent = actor.details.experience.spent + xp
                let log = actor._addToExpLog(xp, game.i18n.format("LOG.MemorizedSpell", { name: spell.name }), newSpent)
                actor.update({ "system.details.experience.spent": newSpent, "system.details.experience.log": log })
                resolve(true)
              }
            },
            free: {
              label: game.i18n.localize("Free"),
              callback: () => { resolve(true) }
            }
          },
          close : () => {resolve(false)}
        }).render(true)
      }
      else resolve(true)
    })
  }


  
  static miracleGainedDialog(miracle, actor)
  {
    let xp = 100 * (actor.getItemTypes("prayer").filter(p => p.prayerType.value == "miracle").length)
    if (xp) {
      new Dialog({
        title: game.i18n.localize("DIALOG.GainPrayer"),
        content: `<p>${game.i18n.format("DIALOG.GainPrayerContent", { xp })}</p>`,
        buttons: {
          ok: {
            label: game.i18n.localize("Ok"),
            callback: () => {
              let newSpent = actor.details.experience.spent + xp
              let log = actor._addToExpLog(xp, game.i18n.format("LOG.GainPrayer", { name: miracle.name }), newSpent)
              actor.update({ "system.details.experience.spent": newSpent, "system.details.experience.log": log })
            }
          },
          free: {
            label: game.i18n.localize("Free"),
            callback: () => { }
          }
        }
      }).render(true)
    }
  }

  static calculateSpellCost(spell, actor)
  {
    let cost = 0
    let bonus = 0
    let currentlyKnown = 0

    if (spell.system.ritual.value)
    {
      return spell.system.ritual.xp;
    }


    if (["slaanesh", "tzeentch", "nurgle"].includes(spell.lore.value))
      return 0

    if (spell.lore.value == "petty" || spell.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty"))
      bonus = actor.characteristics.wp.bonus
    else 
      bonus = actor.characteristics.int.bonus

    if (spell.lore.value != "petty" && spell.lore.value != game.i18n.localize("WFRP4E.MagicLores.petty"))
    {
      currentlyKnown = actor.getItemTypes("spell").filter(i => i.lore.value == spell.lore.value && i.memorized.value).length;
    }
    else if (spell.lore.value == "petty" || spell.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty"))
    {
      currentlyKnown = actor.getItemTypes("spell").filter(i => i.lore.value == spell.lore.value).length;
      if (currentlyKnown < bonus)
        return 0 // First WPB petty spells are free
    }

    let costKey = currentlyKnown
    if (spell.lore.value != "petty" && spell.lore.value != game.i18n.localize("WFRP4E.MagicLores.petty"))
      costKey++ // Not sure if this is right, but arcane and petty seem to scale different per th example given

    cost = Math.ceil(costKey / bonus) * 100

    if (spell.lore.value == "petty" || spell.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty")) cost *= 0.5 // Petty costs 50 each instead of 100

    return cost
  }

  /**
   * Posts the symptom effects, then secretly posts the treatment to the GM.
   * 
   * @param {String} symptom  symptom name to be posted
   */
  static async postSymptom(symptom) {
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
        content: await TextEditor.enrichHTML(content, {async: true})
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
  static  async postProperty(property) {
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
      content: await TextEditor.enrichHTML(propertyDescription, {async: true})
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
  static chatDataSetup(content, modeOverride, isRoll = false, {forceWhisper, alias, flavor}={}) {
    let chatData = {
      user: game.user.id,
      rollMode: modeOverride || game.settings.get("core", "rollMode"),
      content: content
    };
    if (isRoll)
      chatData.sound = CONFIG.sounds.dice

    if (["gmroll", "blindroll"].includes(chatData.rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatData.rollMode === "blindroll") chatData["blind"] = true;
    else if (chatData.rollMode === "selfroll") chatData["whisper"] = [game.user.id];

    if (alias)
      chatData.speaker = {alias}
    if (flavor)
      chatData.flavor = flavor

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


  static getToken(speaker) {
    return game.scenes.get(speaker?.scene)?.tokens?.get(speaker?.token)
  }

  /**
   * Returns all basic skills from the skills compendium
   */
  static async allBasicSkills() {
    let returnSkills = [];

    const packs = game.wfrp4e.tags.getPacksWithTag(["skill"])

    if (!packs.length)
      return ui.notifications.error(game.i18n.localize("ERROR.Found"))

    for (let pack of packs) {
      let items
      await pack.getDocuments().then(content => items = content.filter(i => i.type == "skill"));
      for (let i of items) {
        if (i.system.advanced.value == "bsc") {
          if (i.system.grouped.value != "noSpec") {
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
    WFRP_Utility.log("Found Basic Skills: ", undefined, returnSkills )
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
      await pack.getDocuments().then(content => items = content.filter(i => i.type == "money").map(i => i.toObject()));

      let money = items.filter(t => Object.values(game.wfrp4e.config.moneyNames).map(n => n.toLowerCase()).includes(t.name.toLowerCase()))

      moneyItems = moneyItems.concat(money)
    }
    WFRP_Utility.log("Found Money Items: ", undefined, moneyItems)
    return moneyItems
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
      else {
        html = await game.wfrp4e.tables.formatChatRoll($(event.currentTarget).attr("data-table"),
          {
            modifier: modifier,
            showRoll: true
          }, $(event.currentTarget).attr("data-column"));
      }

      chatOptions["content"] = html;
      chatOptions["type"] = 0;
      if (html)
        ChatMessage.create(chatOptions);

    }
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

     messageContent = ChatWFRP.addEffectButtons(messageContent, [condkey])

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
      MarketWfrp4e.processCredit(amt, option);

  }

  static handleCorruptionClick(event) {
    return this.postCorruptionTest($(event.currentTarget).attr("data-strength"));
  }

  static postCorruptionTest(strength) {
    renderTemplate("systems/wfrp4e/templates/chat/corruption.hbs", { strength }).then(html => {
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
    renderTemplate("systems/wfrp4e/templates/chat/fear.hbs", { value, name, title }).then(html => {
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
    renderTemplate("systems/wfrp4e/templates/chat/terror.hbs", { value, name, title }).then(html => {
      ChatMessage.create({ content: html, speaker: { alias: name } });
    })
  }


  static postExp(amount, reason = undefined) {
    if (isNaN(amount))
      return ui.notifications.error(game.i18n.localize("ERROR.Experience"))

    let title = `${game.i18n.localize("CHAT.Experience")}`

    renderTemplate("systems/wfrp4e/templates/chat/experience.hbs", { title, amount, reason }).then(html => {
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

  static async applyEffectToTarget(effect, targets, user = game.user) {
    if (!targets && !user.targets.size)
      return ui.notifications.warn(game.i18n.localize("WARNING.Target"))

    if (!targets)
      targets = Array.from(user.targets);

    let targetsBackup = Array.from(user.targets.map(t=>t.id));
      // Remove targets now so they don't start opposed tests
    if (canvas.scene) {
      user.updateTokenTargets([]);
      user.broadcastActivity({targets: []});
    }

    if (game.user.isGM) {
      setProperty(effect, "flags.wfrp4e.effectApplication", "")
      effect.statuses = [effect.name.slugify()];
      let msg = `${game.i18n.format("EFFECT.Applied", {name: effect.name})} ` 
      let actors = [];

      if (effect.flags.wfrp4e.effectTrigger == "oneTime") {
        for (let t of targets) {
          actors.push(t.actor.prototypeToken.name)
          await game.wfrp4e.utility.applyOneTimeEffect(effect, t.actor);
        }
      }
      else {
        for(let t of targets) {
          if (effect.flags.wfrp4e?.promptItem) {
            let choice = await ItemDialog.createFromFilters((0, eval)(effect.flags.wfrp4e.extra), 1, "Choose an Item", t.actor.items.contents)
            if (!choice) {
              continue // If no item selected, do not add effect to target
            }
            else {
              effect.flags.wfrp4e.itemChoice = choice[0]?.id;
            }
          }
          actors.push(t.actor.prototypeToken.name)
          await t.actor.createEmbeddedDocuments("ActiveEffect", [effect])
        }
      }
      msg += actors.join(", ");
      ui.notifications.notify(msg)
    }
    else {
      ui.notifications.notify(game.i18n.localize("APPLYREQUESTGM"))
      const payload = { effect, targets: [...targets].map(t => t.document.toObject()), scene: canvas.scene.id };
      await WFRP_Utility.awaitSocket(game.user, "applyEffects", payload, "invoking effect");
    }
    user.updateTokenTargets(targetsBackup);
    user.broadcastActivity({targets: targetsBackup});
  }

  /** Send effect for owner to apply, unless there isn't one or they aren't active. In that case, do it yourself */
  static async applyOneTimeEffect(effect, actor) {
    if (game.user.isGM) {
      if (actor.hasPlayerOwner) {
        let u = WFRP_Utility.getActorOwner(actor);
        if (u.id != game.user.id) {
          ui.notifications.notify(game.i18n.localize("APPLYREQUESTOWNER"))
          let effectObj = effect instanceof ActiveEffect ? effect.toObject() : effect;
          const payload = { userId: u.id, effect: effectObj, actorData: actor.toObject() };
          await WFRP_Utility.awaitSocket(game.user, "applyOneTimeEffect", payload, "invoking effect");
          return
        }
      }
    }

    await WFRP_Utility.runSingleEffect(effect, actor, null, { actor });
  }

  static async runSingleEffect(effect, actor, item, scriptArgs) {
      try {
        if (WFRP_Utility.effectCanBeAsync(effect)) {
          let asyncFunction = Object.getPrototypeOf(async function () { }).constructor
          const func = new asyncFunction("args", effect.flags.wfrp4e.script).bind({ actor, effect, item })
          WFRP_Utility.log(`${this.name} > Running Async ${effect.name}`)
          await func(scriptArgs);
        } else {
          let func = new Function("args", effect.flags.wfrp4e.script).bind({ actor, effect, item })
          WFRP_Utility.log(`${this.name} > Running ${effect.name}`)
          func(scriptArgs);
        }
      }
      catch (ex) {
        ui.notifications.error(game.i18n.format("ERROR.EFFECT", { effect: effect.name }))
        console.error("Error when running effect " + effect.name + " - If this effect comes from an official module, try replacing the actor/item from the one in the compendium. If it still throws this error, please use the Bug Reporter and paste the details below, as well as selecting which module and 'Effect Report' as the label.")
        console.error(`REPORT\n-------------------\nEFFECT:\t${effect.name}\nACTOR:\t${actor.name} - ${actor.id}\nERROR:\t${ex}`)
      }
  }

  static effectCanBeAsync (effect) {
    return !game.wfrp4e.config.syncEffectTriggers.includes(effect.trigger)
  }

  static async invokeEffect(actor, effectId, itemId) {
    let item, effect
    if (itemId) {
      item = actor.items.get(itemId);
      effect = item.effects.get(effectId)
    }
    else {
       effect = actor.actorEffects.get(effectId)
       item = effect.item
    }
     
    await effect.reduceItemQuantity()
    await WFRP_Utility.runSingleEffect(effect, actor, item, {actor, effect, item});
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
      return actor.setupCharacteristic(itemName, bypassData).then(test => test.roll());
    }
    else {
      item = actor ? actor.getItemTypes(itemType).find(i => i.name === itemName) : null;
    }
    if (!item) return ui.notifications.warn(`${game.i18n.localize("ErrorMacroItemMissing")} ${itemName}`);

    // Trigger the item roll
    switch (item.type) {
      case "weapon":
        return actor.setupWeapon(item, bypassData).then(test => test.roll());
      case "spell":
        return actor.sheet.spellDialog(item, bypassData)
      case "prayer":
        return actor.setupPrayer(item, bypassData).then(test => test.roll());
      case "trait":
        return actor.setupTrait(item, bypassData).then(test => test.roll());
      case "skill":
        return actor.setupSkill(item, bypassData).then(test => test.roll());
    }
  }

  static async toggleMorrslieb() {

    let morrsliebActive = canvas.scene.getFlag("wfrp4e", "morrslieb")
    morrsliebActive = !morrsliebActive
    await canvas.scene.setFlag("wfrp4e", "morrslieb", morrsliebActive)

    if (game.modules.get("fxmaster") && game.modules.get("fxmaster").active) {
      FXMASTER.filters.switch("morrslieb", "color", CONFIG.MorrsliebObject)
    }
    else {
      game.socket.emit("system.wfrp4e", {
        type: "morrslieb"
      })
      canvas.draw();
    }
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


  static updateGroupAdvantage({players=undefined, enemies=undefined}={})
  {
    if (!game.user.isGM)
    {
      game.socket.emit("system.wfrp4e", {type : "changeGroupAdvantage", payload : {players, enemies}})
    }
    else 
    {
      let advantage = game.settings.get("wfrp4e", "groupAdvantageValues");
      if (Number.isNumeric(players))
        advantage.players = players
      if (Number.isNumeric(enemies))
        advantage.enemies = enemies
    
      return game.settings.set("wfrp4e", "groupAdvantageValues", advantage)
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


  static log(message, force=false, args) {
    if (CONFIG.debug.wfrp4e || force)
      console.log(`%cWFRP4e` + `%c | ${message}`, "color: gold", "color: unset", args || "");
  }

  
  static logHomebrew(message) {
    this.log("Applying Homebrew Rule: " + message, true)
  }

  static extractLinkLabel(link)
  {
    let text
    try {
      // Extract text
      text = Array.from(link.matchAll(/{(.+?)}/gm))[0][1]
      if (!text)
        text = link
    }
    catch(e)
    {
      text = link
    }
    return text
  }


  // Since popout tokens display very small in HTML, try to replace them
  static replacePopoutTokens(html) {
    // Try to replace popout tokens in chat
    let images = html.find('img:not(.profile)'); // This is required to prevent saving the absolute actor image path
    Array.from(images).forEach(async element => {
      element.src = this.replacePopoutPath(element.src)
    })
  }

  static replacePopoutPath(path)
  {
    if (path.includes("tokens/popout/")) { 
      WFRP_Utility.log("Replacing popout token: " + path)
    }
    return path.replace("tokens/popout/", "tokens/");
  }

  static async sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  static getActorOwner(actor) { 
    if (actor.hasPlayerOwner) {
      for (let u of game.users.contents.filter(u => u.active && !u.isGM)) {
        if (u.character?.id === actor.id) {
          return u;
        }
      }
      for (let u of game.users.contents.filter(u => u.active && !u.isGM)) {
        if (actor.ownership.default >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER || actor.ownership[u.id] >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
        return u;
        }
      }
    }
    return game.users.contents.find(u => u.active && u.isGM);
  }

  static async awaitSocket(owner, type, payload, content) {
    let msg = await WFRP_Utility.createSocketRequestMessage(owner, content);
    payload.socketMessageId = msg.id;
    game.socket.emit("system.wfrp4e", {
      type: type,
      payload: payload
    });
    do {
      await WFRP_Utility.sleep(250);
      msg = game.messages.get(msg.id);
    } while (msg);
  }

  static async createSocketRequestMessage(owner, content) {
    let chatData = {
      content: `<p class='requestmessage'><b><u>${owner.name}</u></b>: ${content}</p?`,
      whisper: ChatMessage.getWhisperRecipients("GM")
    }
    if (game.user.isGM) {
      chatData.user = owner;
    }
    let msg = await ChatMessage.create(chatData);
    return msg;
  }

  static mergeCareerReplacements(replacements)
  {

    // For each species in added replacements
    for(let species in replacements)
    {
      // Check if there already is a species listing
      if (game.wfrp4e.config.speciesCareerReplacements[species])
      {
        let currentReplacements = game.wfrp4e.config.speciesCareerReplacements[species]

        // For each career in the added replacements
        for(let career in replacements[species])
        {
          // If there are replacement options already, concatenate them
          if (currentReplacements[career]?.length > 0)
          {
            currentReplacements[career] = currentReplacements[career].concat(replacements[species][career])
          }
          else  // If no current replacement opions, simply use the added replacements
          {
            currentReplacements[career] = replacements[species][career]
          }
        }
      }
      else // If no species listing, simply use the added replacements 
      {
        game.wfrp4e.config.speciesCareerReplacements[species] = replacements[species];
      }
    }
  }

  // Add the source of a compendium link
  // e.g. Compendium.wfrp4e-core -> (WFRP4e Core Rulebook) tooltip
  static addLinkSources(html)
  {
    html.find(".content-link").each((index, element) => {
      let uuid = element.dataset.uuid;
      let tooltip = element.dataset.tooltip || "";
      if (uuid)
      {
        let moduleKey = uuid.split(".")[1];
        if (game.wfrp4e.config.premiumModules[moduleKey])
        {
          if (!tooltip)
          {
            tooltip = `${game.wfrp4e.config.premiumModules[moduleKey]}`
          }
          else 
          {
            tooltip += ` (${game.wfrp4e.config.premiumModules[moduleKey]})`
          }
        }
      }

      element.dataset.tooltip = tooltip;

    })
  }
}


Hooks.on("renderFilePicker", (app, html, data) => {
  let folder = data.target.split("/")[0];
  if (folder == "systems" || folder == "modules") {
    html.find("input[name='upload']").css("display", "none")
    let label = html.find(".upload-file label")
    label.text("Upload Disabled");
    label.append(`<i data-tooltip="Upload disabled while in system directory. DO NOT put your assets within any system or module folder." style="display:inline-block; margin-left:5px;" class="fa-regular fa-circle-question"></i>`)
  }
})  