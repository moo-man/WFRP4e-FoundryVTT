import MarketWFRP4e from "../apps/market-wfrp4e.js";
import { CorruptionMessageModel } from "../model/message/corruption.js";
import { PayMessageModel } from "../model/message/pay.js";
import { PsychMessageModel } from "../model/message/psych.js";
import { XPMessageModel } from "../model/message/xp.js";


/**
 * Provides general useful functions for various different parts of the system.
 *
 * This is basically a catch-all for useful functions that don't quite fit anywhere
 * else, but is used by many different areas of the system. Most of these functions
 * involve retrieving data from the configuration values or the compendia.
 *
 */
export default class WFRP_Utility {
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
      warhammer.utility.log("Could not find species " + species + ": " + error, true);
      throw error
    }


    for (let char in game.wfrp4e.config.characteristics) {
      if (average) {
        // Take average - 2d10+20 -> split on +, take the 20, add 10 (average of 2d10). This assumes, perhaps erroneously, that all species will have a 2d10 randomizer
        characteristics[char] = { value: Roll.safeEval(characteristicFormulae[char].replace("2d10", "10")) , formula: characteristicFormulae[char] }
      }
      else {
        let roll = await new Roll(characteristicFormulae[char]).roll({allowInteractive : false})
        characteristics[char] = { value: roll.total, formula: characteristicFormulae[char] + ` (${roll.result})` }
      }
    }
    return characteristics
  }


  static speciesSkillsTalents(species, subspecies) {
    let skills, talents, randomTalents, talentReplacement, traits;

    skills = game.wfrp4e.config.speciesSkills[species];
    talents = game.wfrp4e.config.speciesTalents[species];
    randomTalents = game.wfrp4e.config.speciesRandomTalents[species] || {talents: 0};
    talentReplacement = game.wfrp4e.config.speciesTalentReplacement[species] || {};
    traits = game.wfrp4e.config.speciesTraits[species] || [];

    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].skills)
      skills = game.wfrp4e.config.subspecies[species][subspecies].skills;

    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].talents)
      talents = game.wfrp4e.config.subspecies[species][subspecies].talents;

    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].randomTalents)
      randomTalents = game.wfrp4e.config.subspecies[species][subspecies].randomTalents || {talents: 0};

    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].talentReplacement)
      talentReplacement = game.wfrp4e.config.subspecies[species][subspecies].talentReplacement || {};

    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].speciesTraits)
    {
      traits = game.wfrp4e.config.subspecies[species][subspecies].speciesTraits || [];
    }

    return { skills, talents, randomTalents, talentReplacement, traits };
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

  static getSystemEffects(vehicle=false) {
    if (vehicle)
    {
      return foundry.utils.duplicate(game.wfrp4e.config.vehicleSystemEffects)
    }
    else 
    {
      return foundry.utils.mergeObject(foundry.utils.duplicate(game.wfrp4e.config.systemEffects), foundry.utils.duplicate(game.wfrp4e.config.symptomEffects))
    }

  }

  static find(name, type)
  {
    if (type == "skill")
      return this.findSkill(name)
    if (type == "talent")
      return this.findTalent(name)
    else 
      return this.findItem(name, type)
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
    let skill = await this.findExactName(skillName, "skill");

    if (skill)
      return skill;

    skill = await this.findBaseName(skillName, "skill");

    if (skill)
    {
      let skillData = skill.toObject();
      skillData.effects = [];
      return new Item.implementation(skillData);
    }

    throw `"${game.i18n.format("ERROR.NoSkill", {skill: skillName})}"`;
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
    let talent = await WFRP_Utility.findExactName(talentName, "talent");

    if (talent)
      return talent;

    talent = await WFRP_Utility.findBaseName(talentName, "talent");

    if (talent)
      return talent;

    throw `"${game.i18n.format("ERROR.NoTalent", {talent: talentName})}"`;
  }

  /**
   * Finds an item of the exact same name (Prejudice (Target) !== Prejudice (Nobles)).
   *
   * @param {string} name item name to be searched for
   * @param {[]|string} type type or array of types of item to be searched for
   *
   */
  static async findExactName(name, type) {
    if (typeof type === "string")
      type = [type];

    if (!type)
      type = [];

    // First try world items
    let searchResult = game.items.contents.find(t => (type.length == 0 || type.includes(t.type)) && t.name === name);

    if (searchResult) {
      return searchResult;
    }

    // Search compendium packs for base name item
    for (let pack of game.wfrp4e.tags.getPacksWithTag(type)) {
      const index = pack.indexed ? pack.index : await pack.getIndex();
      let indexResult = index.find(t => t.name === name && (type.length == 0 || type.includes(t.type)));

      if (indexResult)
        return pack.getDocument(indexResult._id);
    }
  }

  /**
   * Finds an item with the same base name (Prejudice (Target) == Prejudice (Nobles)).
   *
   * @param {String} name item name to be searched for
   * @param {Collection} collection collection to search in, could be a world collection or pack index
   * @param {String} pack if collection is a pack index, include the pack to retrieve the document
   *
   */
  static async findBaseName(name, type)
  {
    if (typeof type == "string")
    {
      type = [type];
    }

    if (!type)
    {
      type = [];
    }

    let baseName = this.extractBaseName(name);

    let searchResult = game.items.contents.find(t => (type.length == 0 || type.includes(t.type)) && (t.name == name || this.extractBaseName(t.name) == baseName));
    if (!searchResult)
    {
      // Search compendium packs for base name item
      for (let pack of game.wfrp4e.tags.getPacksWithTag(type)) {
        const index = pack.indexed ? pack.index : await pack.getIndex();
        let indexResult = index.find(t => this.extractBaseName(t.name) == this.extractBaseName(name) && (type.length == 0 || type.includes(t.type))) // if type is specified, check, otherwise it doesn't matter
        if (indexResult)
          searchResult = await pack.getDocument(indexResult._id)
      }
    }

    if (searchResult) {
      let item = searchResult.clone();
      item.updateSource({ name }); // This is important if a specialized talent wasn't found. Without it, <Talent ()> would be added instead of <Talent (Specialization)>
      return item;
    }
  }

  static extractBaseName(name)
  {
    return name.split("(")[0].trim();
  }


  // Obviously this isn't very good, but it works for now
  static extractParenthesesText(name="", opening="(")
  {
    // Default
    let closing = ")"

    if (opening == "[")
      closing = "]"

    if (opening == "<")
      closing = ">"

    return name.split(opening)[1]?.split(closing)[0].trim();
  }


  /**
   * 
   * @param {String} itemName   Item name to be searched for 
   * @param {String|Array} itemType   Item's type (armour, weapon, etc.)
   */
  static async findItem(itemName, itemType) {
    let item = await WFRP_Utility.findExactName(itemName, itemType)

    if (item)
      return item;

    item = await WFRP_Utility.findBaseName(itemName, itemType)

    if (item)
      return item;

    console.error("Cannot find " + itemName);
  }


  // Used to sort arrays based on string value (used in organizing skills to be alphabetical - see ActorWFRP4e.prepareItems())
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
  static qualityList(type = null) {
    let weapon = foundry.utils.duplicate(game.wfrp4e.config.weaponQualities);
    let armor = foundry.utils.duplicate(game.wfrp4e.config.armorQualities);
    let item = foundry.utils.duplicate(game.wfrp4e.config.itemQualities);

    switch (type) {
      case "weapon":
        return foundry.utils.mergeObject(item, weapon);
      case "armor":
        return foundry.utils.mergeObject(item, armor);
      default:
        return foundry.utils.mergeObject(weapon, foundry.utils.mergeObject(item, armor));
    }
  }


  /**
   * Return a list of all flaws
   */
  static flawList(type = null) {
    let weapon = foundry.utils.duplicate(game.wfrp4e.config.weaponFlaws);
    let armor = foundry.utils.duplicate(game.wfrp4e.config.armorFlaws);
    let item = foundry.utils.duplicate(game.wfrp4e.config.itemFlaws);

    switch (type) {
      case "weapon":
        return foundry.utils.mergeObject(item, weapon);
      case "armor":
        return foundry.utils.mergeObject(item, armor);
      default:
        return foundry.utils.mergeObject(weapon, foundry.utils.mergeObject(item, armor));
    }
  }

  static allProperties(type = null) {
    return foundry.utils.mergeObject(this.qualityList(type), this.flawList(type))
  }


  /**
   * Posts the symptom effects, then secretly posts the treatment to the GM.
   * 
   * @param {String} symptom  symptom name to be posted
   */
  static async postSymptom(symptom) {
    let symkey = warhammer.utility.findKey(symptom.split("(")[0].trim(), game.wfrp4e.config.symptoms)
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
        content: await foundry.applications.ux.TextEditor.implementation.enrichHTML(content, {async: true})
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
  static  async postProperty(propertyText) {
    let properties = foundry.utils.mergeObject(WFRP_Utility.qualityList(), WFRP_Utility.flawList()),
      propertyDescr = Object.assign(duplicate(game.wfrp4e.config.qualityDescriptions), game.wfrp4e.config.flawDescriptions),
      propertyKey;

    let property = this.parsePropertyName(propertyText.replace(/,/g, '').trim());

    propertyKey = warhammer.utility.findKey(property, properties)

    let propertyDescription = propertyDescr[propertyKey];
    propertyDescription = propertyDescription.replace("(Rating)", property.split(" ")[1])


    let chatOptions = {
      user: game.user.id,
      rollMode: game.settings.get("core", "rollMode"),
      speaker : {alias : propertyText},
      content: await foundry.applications.ux.TextEditor.implementation.enrichHTML(propertyDescription, {async: true})
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
    if (speaker.token && speaker.scene)
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
    let skillData = []

    const packs = game.wfrp4e.tags.getPacksWithTag(["skill"])

    if (!packs.length)
      return []

    for (let pack of packs) 
    {
      let skills = (await pack.getDocuments({ type__in: ["skill"] })).filter(i => i.system.isBasic)
      for (let i of skills) 
      {
        if (i.system.isGrouped) 
        {
          if (!i.specifier) 
          {
            let data = i.toObject();
            data.name = i.baseName;
            skillData.push(data)
          }
        }
        else 
        {
          skillData.push(i.toObject())
        }
      }
    }
    warhammer.utility.log("Found Basic Skills: ", undefined, skillData)
    return skillData;
  }

  /**
   * Returns Gold Crown, Silver Shilling, and Brass Penny from trappings compendium
   */
  static async allMoneyItems() {
    let moneyItems = []
    const packs = game.wfrp4e.tags.getPacksWithTag("money")

    if (!packs.length)
      return []

    for (let pack of packs) {
      let items
      await pack.getDocuments().then(content => items = content.filter(i => i.type == "money").map(i => i.toObject()));

      let money = items.filter(t => Object.values(game.wfrp4e.config.moneyNames).map(n => n.toLowerCase()).includes(t.name.toLowerCase()))

      moneyItems = moneyItems.concat(money.filter(m => !moneyItems.find(i => i.name.toLowerCase() == m.name.toLowerCase()))) // Remove duplicates
    }
    warhammer.utility.log("Found Money Items: ", undefined, moneyItems)
    return moneyItems
  }

  static alterDifficulty(difficulty, steps) {
    let difficulties = Object.keys(game.wfrp4e.config.difficultyLabels)
    let difficultyIndex = difficulties.findIndex(d => d == difficulty) + steps
    difficultyIndex = Math.clamped(difficultyIndex, 0, difficulties.length - 1)
    return difficulties[difficultyIndex]
  }


  /**
   * Collects data from the table click event and sends it to game.wfrp4e.tables to be rolled.
   * 
   * @param {Object} event  click event
   */
  static async handleTableClick(event, target) {
    let modifier = parseInt(target.dataset.modifier) || 0;
    let messageId= this.id;
    let html;
    let chatOptions = this.chatDataSetup("", game.settings.get("core", "rollMode"), true)

    if (event.button == 0) {
      let clickText = event.target.text || event.target.textContent;
      if (clickText.trim() == game.i18n.localize("ROLL.CritCast")) {
        html = game.wfrp4e.tables.criticalCastMenu(target.dataset.table);
      }

      else if (clickText.trim() == game.i18n.localize("ROLL.TotalPower"))
        html = game.wfrp4e.tables.restrictedCriticalCastMenu();

      // Not really a table but whatever
      else if (target.dataset.table == "misfire") {
        let damage = target.dataset.damage
        html = game.i18n.format("ROLL.Misfire", { damage: damage });
      }
      else {
        html = await game.wfrp4e.tables.formatChatRoll(target.dataset.table,
          {
            modifier: modifier,
            showRoll: true,
            messageId
          }, target.dataset.column);
      }

      chatOptions["content"] = html;
      chatOptions["type"] = 0;
      if (!foundry.utils.isEmpty(html))
      {
        ChatMessage.create(chatOptions);
      }

    }
  }

  /**
   * Post condition when clicked.
   * 
   * @param {Object} event click event
   */
  static handleConditionClick(event, target) {
    let cond = target.dataset.cond;
    if (!cond)
      cond = event.target.text.trim();
    if (!isNaN(cond.split(" ").pop())) // check if the condition level is specified
      cond = cond.split(" ").slice(0, -1).join(" ") // remove the condition level
    let condkey = warhammer.utility.findKey(cond, game.wfrp4e.config.conditions, { caseInsensitive: true });
    let condName = game.wfrp4e.config.conditions[condkey];
    let condDescr = game.wfrp4e.config.conditionDescriptions[condkey];
    let messageContent = `<b>${condName}</b><br>${condDescr}`

    let chatData = WFRP_Utility.chatDataSetup(messageContent)
    ChatMessage.create(chatData);
  }

  /**
   * Post property description when clicked.
   *
   * @param {Object} event click event
   */
  static handlePropertyClick(event, target) {
    let prop = target.text.trim();

    // If property rating is present, remove it
    if (!isNaN(prop.split(" ").pop()))
      prop = prop.split(" ").slice(0, -1).join(" ");

    const allProps = this.allProperties();
    const propKey = warhammer.utility.findKey(prop, allProps, { caseInsensitive: true });
    const propName = allProps[propKey];
    const description = game.wfrp4e.config.qualityDescriptions[propKey] || game.wfrp4e.config.flawDescriptions[propKey];
    const messageContent = `<b>${propName}</b><br>${description}`;

    const chatData = WFRP_Utility.chatDataSetup(messageContent, null);
    ChatMessage.create(chatData);
  }

  /**
   * Post symptom when clicked
   * 
   * @param {Object} event click event
   */
  static handleSymptomClick(event, target) {
    let symptom = target.dataset.symptom;
    if (!symptom)
      symptom = target.text;
    WFRP_Utility.postSymptom(symptom)
  }

  /**
   * Roll to chat when roll entity is clicked
   * 
   * @param {Object} event clicke event
   */
  static async handleRollClick(event, target) {
    let roll = target.dataset.roll;
    if (!roll)
      roll = target.text.trim();
    let rollMode = game.settings.get("core", "rollMode");
    (await new Roll(roll).roll({allowInteractive : false})).toMessage(
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
  static handlePayClick(event, target) {
    let payString = target.dataset.args;
    if (game.user.isGM)
      game.wfrp4e.commands.call("pay", payString);
    else
      MarketWFRP4e.handlePlayerPayment({payString});
  }

  static handleCreditClick(event, target) 
  {
    game.wfrp4e.commands.call("credit", target.dataset.args);
  }

  static handleCorruptionClick(event, target)
  {
    CorruptionMessageModel.createCorruptionMessage(target.dataset.strength);
  }

  static postCorruptionTest(strength, chatData={})
  {
    console.warn("WFRP4e | WFRP_Utility.postCorruptionTest is deprecated, use CorruptionMessageModel.createCorruptionMessage instead")
    CorruptionMessageModel.createCorruptionMessage(strength, {}, chatData)
  }


  static handleFearClick(event, target) {
    return PsychMessageModel.createFearMessage(target.dataset.value, target.dataset.name);
  }

  static postFear(value = 0, name = undefined) {
    console.warn("WFRP4e | WFRP_Utility.postFear is deprecated, use PsychMessageModel.createFearMessage instead")
    return PsychMessageModel.createFearMessage(value, name);
  }

  static handleTerrorClick(event, target) {
    return PsychMessageModel.createTerrorMessage(target.dataset.value, target.dataset.name);
  }

  static handleExpClick(event, target) {
    return XPMessageModel.handleXPCommand(target.dataset.amount, target.dataset.reason);
  }

  static postTerror(value = 1, name = undefined) {
    console.warn("WFRP4e | WFRP_Utility.postTerror is deprecated, use PsychMessageModel.createTerrorMessage instead")
    return PsychMessageModel.createTerrorMessage(value, name);
  }


  static postExp(amount, reason = undefined) {
    console.warn("WFRP4e | WFRP_Utility.postExp is deprecated, use XPMessageModel.handleXpCommand instead")
    return XPMessageModel.handleXPCommand(amount, reason);
  }


  static _onDragConditionLink(event) {
    event.stopPropagation();
    const a = event.currentTarget;
    let dragData = null;
    dragData = { type: "condition", payload: a.dataset.cond };

    event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify(dragData));
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
      item = actor ? actor.itemTags[itemType].find(i => i.name === itemName) : null;
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

  static updateGroupAdvantage({players=undefined, enemies=undefined}={})
  {
    if (!game.user.isGM)
    {
      game.socket.emit("system.wfrp4e", {type : "changeGroupAdvantage", payload : {players, enemies}})
    }
    else if (game.user.isUniqueGM)
    {
      let advantage = game.settings.get("wfrp4e", "groupAdvantageValues");
      if (Number.isNumeric(players))
        advantage.players = players
      if (Number.isNumeric(enemies))
        advantage.enemies = enemies
    
      return game.settings.set("wfrp4e", "groupAdvantageValues", advantage)
    }
  }
  
  static logHomebrew(message) {
    warhammer.utility.log("Applying Homebrew Rule: " + message, true)
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
}
