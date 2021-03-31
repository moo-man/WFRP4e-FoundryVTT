/**
 * The ItemWfrp4e class only provides two core functionalities
 * 
 * 1. Expansion data - what data is shown for the dropdown expansions
 * 2. Chat data - what data is in the chat card when the item is posted
 * 
 * Expansion and chat data is defined for each different item type
 * 
 */

import WFRP_Utility from "../system/utility-wfrp4e.js";


export default class ItemWfrp4e extends Item {
  // Upon creation, assign a blank image if item is new (not duplicated) instead of mystery-man default
  static async create(data, options) {
    if (!data.img)
      data.img = "systems/wfrp4e/icons/blank.png";
    super.create(data, options);
  }

  prepareData() {
      super.prepareData();
      // if (this.isOwned && this.actor.effects) // Do not run effects if actor isn't prepared yet (startup)
      //   this.actor.runEffects("prePrepareItem", {item: this.data})
      const data = this.data;
      if (this.data.type == "skill")
        this.prepareSkill()

      // if (this.isOwned && this.actor.effects)
      //   this.actor.runEffects("prepareItem", {item: this.data})
    
      if (this.data.type=="cargo" && this.data.data.cargoType.value != "wine" && this.data.data.cargoType.value != "brandy")
        this.data.data.quality.value = "average"
  }


  prepareSkill()
  {
    if (this.data.type != "skill")
      return

    const data = this.data;

    if(!hasProperty(data, "data.modifier.value"))
      setProperty(data, "data.modifier.value", 0)
  
    if (this.isOwned)
    {
      if (!data.data.total)
        data.data.total = {};
      data.data.total.value = data.data.modifier.value + data.data.advances.value + this.actor.data.data.characteristics[data.data.characteristic.value].value
    }
  }

  /******* ITEM EXPAND DATA ***********
   * Expansion data is called when an item's dropdown is created. Each function organizes a 'properties' array. 
   * Each element of the array is shown at the bottom of the dropdown expansions. The description is shown above this.
   */

  /**
   * Call the appropriate item type's expansion data.
   * 
   * @param {Object} htmlOptions    Currently unused - example: show secrets?
   */
  getExpandData(htmlOptions) {
    const data = this[`_${this.data.type}ExpandData`]();
    data.description.value = data.description.value || "";
    data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);
    data.targetEffects = this.data.effects.filter(e => getProperty(e, "flags.wfrp4e.effectApplication") == "apply")
    data.invokeEffects = this.data.effects.filter(e => getProperty(e, "flags.wfrp4e.effectTrigger") == "invoke")
    return data;
  }

  // Trapping Expansion Data
  _trappingExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    return data;
  }

  // Money Expansion Data
  _moneyExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [`${game.i18n.localize("ITEM.PenniesValue")}: ${data.coinValue.value}`];
    return data;
  }

  // Psychology Expansion Data
  _psychologyExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    return data;
  }

  // Mutation Expansion Data
  _mutationExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    data.properties.push( game.wfrp4e.config.mutationTypes[this.data.data.mutationType.value]);
    if (this.data.data.modifier.value)
      data.properties.push(this.data.data.modifier.value)
    return data;
  }

  // Disease Expansion Data
  _diseaseExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    data.properties.push(`<b>${game.i18n.localize("Contraction")}:</b> ${data.contraction.value}`);
    data.properties.push(`<b>${game.i18n.localize("Incubation")}:</b> ${data.incubation.value} ${data.incubation.unit}`);
    data.properties.push(`<b>${game.i18n.localize("Duration")}:</b> ${data.duration.value} ${data.duration.unit}`);
    data.properties = data.properties.concat(this.data.effects.map(i => i = "<a class ='symptom-tag'><i class='fas fa-user-injured'></i> " + i.label.trim() + "</a>").join(", "));
    if (data.permanent.value)
      data.properties.push(`<b>${game.i18n.localize("Permanent")}:</b> ${data.permanent.value}`);
    return data;
  }

  // Talent Expansion Data
  _talentExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    return data;
  }

  // Trait Expansion Data
  _traitExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    return data;
  }

  // Career Expansion Data
  _careerExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    data.properties.push(`<b>${game.i18n.localize("Class")}</b>: ${this.data.data.class.value}`);
    data.properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.data.data.careergroup.value}`);
    data.properties.push( game.wfrp4e.config.statusTiers[this.data.data.status.tier] + " " + this.data.data.status.standing);
    data.properties.push(`<b>${game.i18n.localize("Characteristics")}</b>: ${this.data.data.characteristics.map(i => i = " " +  game.wfrp4e.config.characteristicsAbbrev[i])}`);
    data.properties.push(`<b>${game.i18n.localize("Skills")}</b>: ${this.data.data.skills.map(i => i = " " + i)}`);
    data.properties.push(`<b>${game.i18n.localize("Talents")}</b>: ${this.data.data.talents.map(i => i = " " + i)}`);
    data.properties.push(`<b>${game.i18n.localize("Trappings")}</b>: ${this.data.data.trappings.map(i => i = " " + i)}`);
    data.properties.push(`<b>${game.i18n.localize("Income")}</b>: ${this.data.data.incomeSkill.map(i => ` <a class = 'career-income' data-career-id=${this.data._id}> ${this.data.data.skills[i]} <i class="fas fa-coins"></i></a>`)}`);
    // When expansion data is called, a listener is added for 'career-income'
    return data;
  }

  // Injury Expansion Data
  _injuryExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    return data;
  }

  // Critical Expansion Data
  _criticalExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [];
    data.properties.push(`<b>${game.i18n.localize("Wounds")}</b>: ${this.data.data.wounds.value}`)
    if (data.modifier.value)
      data.properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${this.data.data.modifier.value}`)
    return data;
  }

  // Spell Expansion Data
  _spellExpandData() {
    const data = duplicate(this.data.data);
    let preparedSpell = this.actor.prepareSpellOrPrayer(duplicate(this.data));
    data.description = preparedSpell.data.description
    data.properties = [];
    data.properties.push(`${game.i18n.localize("Range")}: ${preparedSpell.range}`);
    let target = preparedSpell.target;
    if (target.includes("AoE"))
      target = `<a class='aoe-template'><i class="fas fa-ruler-combined"></i>${target}</a>`
    data.properties.push(`${game.i18n.localize("Target")}: ${target}`);
    data.properties.push(`${game.i18n.localize("Duration")}: ${preparedSpell.duration}`);
    if (data.magicMissile.value)
      data.properties.push(`${game.i18n.localize("Magic Missile")}: +${preparedSpell.damage}`);
    else if (preparedSpell.data.damage.value || preparedSpell.data.damage.dices)
    {
      let damage = preparedSpell.damage || "";
      if (preparedSpell.data.damage.dice)
        damage += " + " + preparedSpell.data.damage.dice
      data.properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
    }
    return data;
  }

  // Prayer Expansion Data
  _prayerExpandData() {
    const data = duplicate(this.data.data);
    let preparedPrayer = this.actor.prepareSpellOrPrayer(this.data);
    data.properties = [];
    data.properties.push(`${game.i18n.localize("Range")}: ${preparedPrayer.range}`);
    data.properties.push(`${game.i18n.localize("Target")}: ${preparedPrayer.target}`);
    data.properties.push(`${game.i18n.localize("Duration")}: ${preparedPrayer.duration}`);
    let damage = preparedPrayer.damage || "";
    if (preparedPrayer.data.damage.dice)
      damage += " + " + preparedPrayer.data.damage.dice
    if (preparedPrayer.data.damage.addSL)
      damage += " + " + game.i18n.localize("SL")
    if (preparedPrayer.data.damage.value)
      data.properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
    return data;
  }

  // Weapon Expansion Data
  _weaponExpandData() {
    const data = duplicate(this.data.data);
    let properties = [];

    if (data.weaponGroup.value)
      properties.push( game.wfrp4e.config.weaponGroups[data.weaponGroup.value]);
    if (data.range.value)
      properties.push(`${game.i18n.localize("Range")}: ${data.range.value}`);
    if (data.damage.value)
    {
      let damage = data.damage.value
      if (data.damage.dice)
        damage += " + " + data.damage.dice
      properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
    }
    if (data.twohanded.value)
      properties.push(game.i18n.localize("ITEM.TwoHanded"));
    if (data.reach.value)
      properties.push(`${game.i18n.localize("Reach")}: ${ game.wfrp4e.config.weaponReaches[data.reach.value] + " - " +  game.wfrp4e.config.reachDescription[data.reach.value]}`);
    if (data.weaponDamage)
      properties.push(`<b>${game.i18n.localize("ITEM.WeaponDamaged")} ${data.weaponDamage} points</b>`)
    if (data.APdamage)
      properties.push(`${game.i18n.localize("ITEM.ShieldDamaged")} ${data.APdamage} points`)

      let weaponProperties =  WFRP_Utility._prepareQualitiesFlaws(this.data);
      for (let prop in weaponProperties)
        if (Array.isArray(weaponProperties[prop]))
          properties = properties.concat(weaponProperties[prop].map(i => i = "<a class ='item-property'>" + i + "</a>"))

    if (data.special.value)
      properties.push(`${game.i18n.localize("Special")}: ` + data.special.value);

    data.properties = properties.filter(p => !!p);
    return data;
  }

  // Armour Expansion Data
  _armourExpandData() {
    const data = duplicate(this.data.data);
    let properties = [];
    properties.push( game.wfrp4e.config.armorTypes[data.armorType.value]);
    let armourProperties =  WFRP_Utility._prepareQualitiesFlaws(this.data);
    for (let prop in armourProperties)
      if (Array.isArray(armourProperties[prop]))
        properties = properties.concat(armourProperties[prop].map(i => i = "<a class ='item-property'>" + i + "</a>"))
    properties.push(data.penalty.value);

    data.properties = properties.filter(p => !!p);
    return data;
  }

  // Ammunition Expansion Data
  _ammunitionExpandData() {
    const data = duplicate(this.data.data);
    let properties = [];
    properties.push( game.wfrp4e.config.ammunitionGroups[data.ammunitionType.value])

    if (data.range.value)
      properties.push(`${game.i18n.localize("Range")}: ${data.range.value}`);

      if (data.damage.value)
      {
        let damage = data.damage.value
        if (data.damage.dice)
          damage += " + " + data.damage.dice
        properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
      }

      let ammoProperties =  WFRP_Utility._prepareQualitiesFlaws(this.data);
      for (let prop in ammoProperties)
        if (Array.isArray(ammoProperties[prop]))
          properties = properties.concat(ammoProperties[prop].map(i => i = "<a class ='item-property'>" + i + "</a>"))

    if (data.special.value)
      properties.push(`${game.i18n.localize("Special")}: ` + data.special.value);

    data.properties = properties.filter(p => !!p);
    return data;
  }

  _vehicleModExpandData() {
    const data = duplicate(this.data.data);
    data.properties = [game.wfrp4e.config.modTypes[data.modType.value]];
    return data;
  }

    // Cargo Expansion Data
    _cargoExpandData() {
      const data = duplicate(this.data.data);
      data.properties = [];

      if (this.data.data.origin.value)
        data.properties.push(`<b>${game.i18n.localize("ITEM.Origin")}</b>: ${this.data.data.origin.value}`)

      if (game.wfrp4e.config.trade.cargoTypes)
        data.properties.push(`<b>${game.i18n.localize("ITEM.CargoType")}</b>: ${game.wfrp4e.config.trade.cargoTypes[this.data.data.cargoType.value]}`)

      if (game.wfrp4e.config.trade.qualities && (this.data.data.cargoType.value == "wine" || this.data.data.cargoType.value == "brandy"))
        data.properties.push(`<b>${game.i18n.localize("ITEM.CargoQuality")}</b>: ${game.wfrp4e.config.trade.qualities[this.data.data.quality.value]}`)

      return data;
    }


  /**
   * Posts this item to chat.
   * 
   * postItem() prepares this item's chat data to post it to chat, setting up 
   * the image if it exists, as well as setting flags so drag+drop works.
   * 
   */
  async postItem() {
    const properties = this[`_${this.data.type}ChatData`]();
    let chatData = duplicate(this.data);
    chatData["properties"] = properties

    //Check if the posted item should have availability/pay buttons
    chatData.hasPrice = "price" in chatData.data && this.data.type != "cargo";
    if (chatData.hasPrice) {
      if (!chatData.data.price.gc || isNaN(chatData.data.price.gc || 0))
        chatData.data.price.gc = 0;
      if (!chatData.data.price.ss || isNaN(chatData.data.price.ss || 0))
        chatData.data.price.ss = 0;
      if (!chatData.data.price.bp || isNaN(chatData.data.price.bp))
        chatData.data.price.bp = 0;
    }

    let dialogResult = -1;
    if (this.data.type == "weapon" || this.data.type == "armour" || this.data.type == "ammunition" || this.data.type == "container" || this.data.type == "money" || this.data.type=="trapping")
    {
        dialogResult = await new Promise( (resolve, reject) => {new Dialog({
          content : 
          `<p>Add a Quantity?</p>
          <div class="form-group">
            <label> Quantity</label>
            <input name="quantity" type="text" placeholder="Leave blank for infinite"/>
          </div>
          `,
          title : "Post Quantity",
          buttons : {
            post : {
              label : "Post",
              callback: (dlg) => {
                resolve(dlg.find('[name="quantity"]').val())
              }
            },
          }
        }).render(true)
      })
    } 

    if (dialogResult > 0)
    {
      if (this.isOwned)
      {
        if (this.data.data.quantity.value == 0)
          dialogResult = -1
        else if (this.data.data.quantity.value < dialogResult)
        {
          dialogResult = this.data.data.quantity.value
          ui.notifications.notify(`Cannot post more than you have. Post quantity reduced to ${dialogResult}.`) 

          this.update({"data.quantity.value" : 0})
        }
        else {
          ui.notifications.notify(`Quantity reduced by ${dialogResult}.`) 
          this.update({"data.quantity.value" : this.data.data.quantity.value - dialogResult})
        }
      }
    }

    if (dialogResult > 0)
      chatData.postQuantity = dialogResult;


    // Don't post any image for the item (which would leave a large gap) if the default image is used
    if (chatData.img.includes("/blank.png"))
      chatData.img = null;

    renderTemplate('systems/wfrp4e/templates/chat/post-item.html', chatData).then(html => {
      let chatOptions = WFRP_Utility.chatDataSetup(html)

      // Setup drag and drop data
      chatOptions["flags.transfer"] = JSON.stringify(
        {
          type : "postedItem",
          payload: this.data,
        })
      chatOptions["flags.postQuantity"] = dialogResult;
      chatOptions["flags.recreationData"] = chatData;
      ChatMessage.create(chatOptions)
    });
  }

  /******* ITEM CHAT DATA ***********
   * Chat data is called when an item is posted to chat. Each function organizes a 'properties' array. 
   * Each element of the array is shown as a list below the description.
   */

  // Trapping Chat Data
  _trappingChatData() {
    const data = duplicate(this.data.data);
    let properties = [
      `<b>${game.i18n.localize("ITEM.TrappingType")}</b>: ${ game.wfrp4e.config.trappingCategories[data.trappingType.value]}`,
      `<b>${game.i18n.localize("Price")}</b>: ${data.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${data.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${data.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${data.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${ game.wfrp4e.config.availability[data.availability.value] || "-"}`
    ]
    return properties;
  }

  // Skill Chat Data
  _skillChatData() {
    const data = duplicate(this.data.data);
    let properties = []
    properties.push(data.advanced == "adv" ? `<b>${game.i18n.localize("Advanced")}</b>` : `<b>${game.i18n.localize("Basic")}</b>`)
    return properties;
  }

  // Money Chat Data
  _moneyChatData() {
    const data = duplicate(this.data.data);
    let properties = [
      `<b>${game.i18n.localize("ITEM.PenniesValue")}</b>: ${data.coinValue.value}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${data.encumbrance.value}`,
    ]
    return properties;
  }

  // Psychology Chat Data
  _psychologyChatData() {
    return [];
  }

  // Mutation Chat Data
  _mutationChatData() {
    let properties = [
      `<b>${game.i18n.localize("ITEM.MutationType")}</b>: ${ game.wfrp4e.config.mutationTypes[this.data.data.mutationType.value]}`,
    ];
    if (this.data.data.modifier.value)
      properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${this.data.data.modifier.value}`)
    return properties;
  }

  // Disease Chat Data
  _diseaseChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Contraction")}:</b> ${data.contraction.value}`);
    properties.push(`<b>${game.i18n.localize("Incubation")}:</b> <a class = 'chat-roll'><i class='fas fa-dice'></i> ${data.incubation.value}</a>`);
    properties.push(`<b>${game.i18n.localize("Duration")}:</b> <a class = 'chat-roll'><i class='fas fa-dice'></i> ${data.duration.value}</a>`);
    properties.push(`<b>${game.i18n.localize("Symptoms")}:</b> ${(data.symptoms.value.split(",").map(i => i = "<a class ='symptom-tag'><i class='fas fa-user-injured'></i> " + i.trim() + "</a>")).join(", ")}`);
    if (data.permanent.value)
      properties.push(`<b>${game.i18n.localize("Permanent")}:</b> ${data.permanent.value}`);
    return properties;
  }

  // Talent Chat Data
  _talentChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Max")}: </b> ${ game.wfrp4e.config.talentMax[data.max.value]}`);
    if (data.tests.value)
      properties.push(`<b>${game.i18n.localize("Tests")}: </b> ${data.tests.value}`);
    return properties;
  }

  // Trait Chat Data
  _traitChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    if (data.specification.value)
      properties.push(`<b>${game.i18n.localize("Specification")}: </b> ${data.specification.value}`);
    return properties;
  }

  // Career Chat Data
  _careerChatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Class")}</b>: ${this.data.data.class.value}`);
    properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.data.data.careergroup.value}`);
    properties.push(`<b>${game.i18n.localize("Status")}</b>: ${ game.wfrp4e.config.statusTiers[this.data.data.status.tier] + " " + this.data.data.status.standing}`);
    properties.push(`<b>${game.i18n.localize("Characteristics")}</b>: ${this.data.data.characteristics.map(i => i = " " +  game.wfrp4e.config.characteristicsAbbrev[i])}`);
    properties.push(`<b>${game.i18n.localize("Skills")}</b>: ${this.data.data.skills.map(i => i = " " + "<a class = 'skill-lookup'>" + i + "</a>")}`);
    properties.push(`<b>${game.i18n.localize("Talents")}</b>: ${this.data.data.talents.map(i => i = " " + "<a class = 'talent-lookup'>" + i + "</a>")}`);
    properties.push(`<b>${game.i18n.localize("Trappings")}</b>: ${this.data.data.trappings.map(i => i = " " + i)}`);
    properties.push(`<b>${game.i18n.localize("Income")}</b>: ${this.data.data.incomeSkill.map(i => " " + this.data.data.skills[i])}`);
    return properties;
  }

  // Injury Chat Data
  _injuryChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Location")}</b>: ${data.location.value}`);
    if (data.penalty.value)
      properties.push(`<b>${game.i18n.localize("Penalty")}</b>: ${data.penalty.value}`);
    return properties;
  }

  // Critical Chat Data
  _criticalChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Wounds")}</b>: ${data.wounds.value}`);
    properties.push(`<b>${game.i18n.localize("Location")}</b>: ${data.location.value}`);
    if (data.modifier.value)
      properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${data.modifier.value}`);
    return properties;
  }

  // Spell Chat Data
  _spellChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    if ( game.wfrp4e.config.magicLores[data.lore.value])
      properties.push(`<b>${game.i18n.localize("Lore")}</b>: ${ game.wfrp4e.config.magicLores[data.lore.value]}`);
    else
      properties.push(`<b>${game.i18n.localize("Lore")}</b>: ${data.lore.value}`);
    properties.push(`<b>${game.i18n.localize("CN")}</b>: ${data.cn.value}`);
    properties.push(`<b>${game.i18n.localize("Range")}</b>: ${data.range.value}`);
    properties.push(`<b>${game.i18n.localize("Target")}</b>: ${data.target.value}`);
    properties.push(`<b>${game.i18n.localize("Duration")}</b>: ${data.duration.value}`);
    if (data.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${data.damage.value}`);

    return properties;
  }

  // Prayer Chat Data
  _prayerChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Range")}</b>: ${data.range.value}`);
    properties.push(`<b>${game.i18n.localize("Target")}</b>: ${data.target.value}`);
    properties.push(`<b>${game.i18n.localize("Duration")}</b>: ${data.duration.value}`);
    if (data.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${data.damage.value}`);
    return properties;
  }

  // Container Chat Data
  _containerChatData() {
    const data = duplicate(this.data.data);
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${data.price.gc} GC, ${data.price.ss} SS, ${data.price.bp} BP`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${data.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${ game.wfrp4e.config.availability[data.availability.value] || "-"}`
    ]

    properties.push(`<b>${game.i18n.localize("Wearable")}</b>: ${(data.wearable.value ? game.i18n.localize("Yes") : game.i18n.localize("No"))}`);
    properties.push(`<b>${game.i18n.localize("ITEM.CountOwnerEnc")}</b>: ${(data.countEnc.value ? game.i18n.localize("Yes") : game.i18n.localize("No"))}`);
    return properties;
  }

  // Weapon Chat Data
  _weaponChatData() {
    const data = duplicate(this.data.data);
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${data.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${data.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${data.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${data.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${ game.wfrp4e.config.availability[data.availability.value] || "-"}`
    ]

    if (data.weaponGroup.value)
      properties.push(`<b>Group</b>: ${ game.wfrp4e.config.weaponGroups[data.weaponGroup.value]}`);
    if (data.range.value)
      properties.push(`<b>${game.i18n.localize("Range")}</b>: ${data.range.value}`);
    if (data.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${data.damage.value}`);
    if (data.twohanded.value)
      properties.push(`<b>${game.i18n.localize("ITEM.TwoHanded")}</b>`);
    if (data.reach.value)
      properties.push(`<b>${game.i18n.localize("Reach")}</b>: ${ game.wfrp4e.config.weaponReaches[data.reach.value] + " - " +  game.wfrp4e.config.reachDescription[data.reach.value]}`);
    if (data.weaponDamage)
      properties.push(`<b>${game.i18n.localize("ITEM.WeaponDamaged")} ${data.weaponDamage} points</b>`)
    if (data.APdamage)
      properties.push(`${game.i18n.localize("ITEM.ShieldDamaged")} ${data.APdamage} points`)

    let weaponProperties = WFRP_Utility._prepareQualitiesFlaws(this.data);

    // Make qualities and flaws clickable
    weaponProperties.qualities = weaponProperties.qualities.map(i => i = "<a class ='item-property'>" + i + "</a>");
    weaponProperties.flaws = weaponProperties.flaws.map(i => i = "<a class ='item-property'>" + i + "</a>");

    if (weaponProperties.qualities.length)
      properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${weaponProperties.qualities.join(", ")}`)


    if (weaponProperties.flaws.length)
      properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${weaponProperties.flaws.join(", ")}`)


    properties = properties.filter(p => p != game.i18n.localize("Special"));
    if (data.special.value)
      properties.push(`<b>${game.i18n.localize("Special")}</b>: ` + data.special.value);

    properties = properties.filter(p => !!p);
    return properties;
  }

  // Armour Chat Data
  _armourChatData() {
    const data = duplicate(this.data.data);
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${data.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${data.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${data.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${data.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${ game.wfrp4e.config.availability[data.availability.value] || "-"}`
    ]

    if (data.armorType.value)
      properties.push(`<b>${game.i18n.localize("ITEM.ArmourType")}</b>: ${ game.wfrp4e.config.armorTypes[data.armorType.value]}`);
    if (data.penalty.value)
      properties.push(`<b>${game.i18n.localize("Penalty")}</b>: ${data.penalty.value}`);


    for (let apVal in data.currentAP) {
      if (data.currentAP[apVal] == -1)
        data.currentAP[apVal] = data.maxAP[apVal];
    }

    for (let loc in  game.wfrp4e.config.locations)
      if (data.maxAP[loc])
        properties.push(`<b>${ game.wfrp4e.config.locations[loc]} AP</b>: ${data.currentAP[loc]}/${data.maxAP[loc]}`);


    let armourProperties = WFRP_Utility._prepareQualitiesFlaws(this.data);

    // Make qualities and flaws clickable
    armourProperties.qualities = armourProperties.qualities.map(i => i = "<a class ='item-property'>" + i + "</a>");
    armourProperties.flaws = armourProperties.flaws.map(i => i = "<a class ='item-property'>" + i + "</a>");

    if (armourProperties.qualities.length)
      properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${armourProperties.qualities.join(", ")}`)


    if (armourProperties.flaws.length)
      properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${armourProperties.flaws.join(", ")}`)


    properties = properties.filter(p => p != game.i18n.localize("Special"));
    if (data.special.value)
      properties.push(`<b>${game.i18n.localize("Special")}</b>: ` + data.special.value);

    properties = properties.filter(p => !!p);
    return properties;
  }

  // Ammunition Chat Data
  _ammunitionChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    properties.push(`<b>${game.i18n.localize("ITEM.AmmunitionType")}:</b> ${ game.wfrp4e.config.ammunitionGroups[data.ammunitionType.value]}`)

    if (data.range.value)
      properties.push(`<b>${game.i18n.localize("Range")}</b>: ${data.range.value}`);

    if (data.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${data.damage.value}`);

    let ammoProperties = WFRP_Utility._prepareQualitiesFlaws(this.data);

    ammoProperties.qualities = ammoProperties.qualities.map(i => i = "<a class ='item-property'>" + i + "</a>");
    ammoProperties.flaws = ammoProperties.flaws.map(i => i = "<a class ='item-property'>" + i + "</a>");

    if (ammoProperties.qualities.length)
      properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${ammoProperties.qualities.join(", ")}`)


    if (ammoProperties.flaws.length)
      properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${ammoProperties.flaws.join(", ")}`)


    properties = properties.filter(p => p != game.i18n.localize("Special"));
    if (data.special.value)
      properties.push(`<b>${game.i18n.localize("Special")}</b>: ` + data.special.value);

    properties = properties.filter(p => !!p);
    return properties;
  }


  _extendedTestChatData() {
    const data = duplicate(this.data.data);
    let properties = [];
    let pct = 0;
    if (this.data.data.SL.target > 0)
      pct = this.data.data.SL.current / this.data.data.SL.target * 100
    if (pct > 100)
      pct = 100
    if (pct < 0)
      pct = 0;
    properties.push(`<b>${game.i18n.localize("Test")}</b>: ${data.test.value}`)
    if (!this.data.data.hide.test && !this.data.data.hide.progress)
      properties.push(`<div class="test-progress">
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${pct}%"></div>
      </div>
      <span><a class="extended-SL">${this.data.data.SL.current}</a> / ${this.data.data.SL.target} SL</span>
    </div>`)

    return properties;
  }

  _vehicleModChatData() {
    const data = duplicate(this.data.data);
    let properties = [
      `<b>${game.i18n.localize("VEHICLE.ModType")}</b>: ${ game.wfrp4e.config.modTypes[data.modType.value]}`,
      `<b>${game.i18n.localize("Price")}</b>: ${data.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${data.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${data.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${data.encumbrance.value}`,
    ]
    return properties
  }

  get isEquipped() {
    if (this.data.type == "armour")
      return !!this.data.data.worn.value
    else if (this.data.type == "weapon")
      return !!this.data.data.equipped
    else if (this.data.type == "trapping" && this.data.data.trappingType.value == "clothingAccessories")
      return !!this.data.data.worn
  }


    // Trapping Chat Data
    _cargoChatData() {
      const data = duplicate(this.data.data);
      let properties = []

      if (this.data.data.origin.value)
        properties.push(`<b>${game.i18n.localize("ITEM.Origin")}</b>: ${this.data.data.origin.value}`)

      if (game.wfrp4e.config.trade.cargoTypes)
        properties.push(`<b>${game.i18n.localize("ITEM.CargoType")}</b>: ${game.wfrp4e.config.trade.cargoTypes[this.data.data.cargoType.value]}`)

      if (game.wfrp4e.config.trade.qualities && (this.data.data.cargoType.value == "wine" || this.data.data.cargoType.value == "brandy"))
        properties.push(`<b>${game.i18n.localize("ITEM.CargoQuality")}</b>: ${game.wfrp4e.config.trade.qualities[this.data.data.quality.value]}`)
      return properties;
    }

  async addCondition(effect, value=1) {
    if (typeof(effect) === "string")
      effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"

    
    let existing = this.hasCondition(effect.id)

    if(existing && existing.flags.wfrp4e.value == null)
      return existing 
    else if (existing)
    {
      existing = duplicate(existing)
      existing.flags.wfrp4e.value += value;
      return this.updateEmbeddedEntity("ActiveEffect", existing)
    }
    else if (!existing)
    {
      effect.label = game.i18n.localize(effect.label);
      if (Number.isNumeric(effect.flags.wfrp4e.value))
        effect.flags.wfrp4e.value = value;
      effect["flags.core.statusId"] = effect.id;
      delete effect.id
      return this.createEmbeddedEntity("ActiveEffect", effect)
    }
  }

  async removeCondition(effect, value=1) {
    if (typeof(effect) === "string")
      effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"

    let existing = this.hasCondition(effect.id)



    if(existing && existing.flags.wfrp4e.value == null)
      return this.deleteEmbeddedEntity("ActiveEffect", existing._id)
    else if (existing)
    {
      existing.flags.wfrp4e.value -= value;

      if (existing.flags.wfrp4e.value <= 0)
        return this.deleteEmbeddedEntity("ActiveEffect", existing._id)
      else 
        return this.updateEmbeddedEntity("ActiveEffect", existing)
    }
  }
  
  
  hasCondition(conditionKey)
  {
    let existing = this.data.effects.find(i => getProperty(i, "flags.core.statusId") == conditionKey)
    return existing
  }


}
// Assign ItemWfrp4e class to CONFIG
CONFIG.Item.entityClass = ItemWfrp4e;
