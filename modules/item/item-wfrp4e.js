import WFRP_Utility from "../system/utility-wfrp4e.js";


export default class ItemWfrp4e extends Item {
  // Upon creation, assign a blank image if item is new (not duplicated) instead of mystery-man default
  async _preCreate(data, options, user) {
    if (data._id && !this.isOwned)
      options.keepId = WFRP_Utility._keepID(data._id, this)

    await super._preCreate(data, options, user)
    if (!data.img)
      this.data.update({ img: "systems/wfrp4e/icons/blank.png" });

    if (this.isOwned) {
      // If not a character and wearable item, set worn to true
      if (this.actor.type != "character" && this.actor.type != "vehicle") {
        if (this.type == "armour")
          this.data.update({ "data.worn.value": true });
        else if (this.type == "weapon")
          this.data.update({ "data.equipped": true });
        else if (this.type == "trapping" && this.trappingType.value == "clothingAccessories")
          this.data.update({ "data.worn": true });
      }

      if (this.type == "vehicleMod" && this.actor.type != "vehicle")
        return false

      if (getProperty(data, "data.location.value"))
        this.data.update({ "data.location.value": "" })

      if (this.effects.size) {
        let immediateEffects = [];
        this.effects.forEach(e => {
          if (e.trigger == "oneTime" && e.application == "actor")
            immediateEffects.push(e)
        })

        immediateEffects.forEach(effect => {
          game.wfrp4e.utility.applyOneTimeEffect(effect, this.actor)
          this.data.effects.delete(effect.id)
        })


      }
    }
  }

  async _preUpdate(updateData, options, user)
  {
    await super._preUpdate(updateData, options, user)
    if (this.type != "skill" || !this.isOwned || this.grouped.value != "isSpec")
      return;
  // If no change
  if (!updateData.name)
    return

  let currentCareer = this.actor.currentCareer;
  if (!currentCareer)
    return
  let careerSkills = duplicate(currentCareer.skills)
  // If career has the skill that was changed, change the name in the career
  if (careerSkills.includes(this.name))
    careerSkills[careerSkills.indexOf(this.name)] = updateData.name
  else // if it doesn't, return
    return;

  let oldName = this.name

  // Ask the user to confirm the change
  new Dialog({
    title: game.i18n.localize("SHEET.CareerSkill"),
    content: `<p>${game.i18n.localize("SHEET.CareerSkillPrompt")}</p>`,
    buttons: {
      yes: {
        label: game.i18n.localize("Yes"),
        callback: async dlg => {
          ui.notifications.notify(`${game.i18n.format("SHEET.CareerSkillNotif", {oldname: oldName, newname: updateData.name, career: currentCareer.name})}`)
          currentCareer.update({"data.skills" : careerSkills})
        }
      },
      no: {
        label: game.i18n.localize("No"),
        callback: async dlg => {
          return;
        }
      },
    },
    default: 'yes'
  }).render(true);
  }


  //#region Data Preparation
  prepareData() {
    super.prepareData();

    // Call all `prepare<Type>` function
    let functionName = `prepare${this.type[0].toUpperCase() + this.type.slice(1, this.type.length)}`
    if (this[`${functionName}`])
      this[`${functionName}`]()


  }

  prepareOwnedData() {

    try {
      this.actor.runEffects("prePrepareItem", { item: this })

      // Call `prepareOwned<Type>` function
      let functionName = `prepareOwned${this.type[0].toUpperCase() + this.type.slice(1, this.type.length)}`
      if (this[`${functionName}`])
        this[`${functionName}`]()


      if (this.encumbrance && this.quantity) {
        this.encumbrance.value = (this.encumbrance.value * this.quantity.value)
        if (this.encumbrance.value % 1 != 0)
          this.encumbrance.value = this.encumbrance.value.toFixed(2)
      }

      if (this.isEquipped && this.type != "weapon") {
        this.encumbrance.value = this.encumbrance.value - 1;
        this.encumbrance.value = this.encumbrance.value < 0 ? 0 : this.encumbrance.value;
      }

      this.actor.runEffects("prepareItem", { item: this })
    }
    catch (e) {
      game.wfrp4e.utility.log(`Something went wrong when preparing actor item ${this.name}: ${e}`)
    }

  }

  prepareAmmunition() { }
  prepareOwnedAmmunition() { }

  prepareArmour() {
    this.damaged = {
      "head": false,
      "lArm": false,
      "rArm": false,
      "lLeg": false,
      "rLeg": false,
      "body": false
    }
   }
  prepareOwnedArmour() { }

  prepareCareer() { }
  prepareOwnedCareer() { }

  prepareContainer() { }
  prepareOwnedContainer() {
    if (!this.countEnc.value)
      this.encumbrance.value = 0;
  }

  prepareCritical() { }
  prepareOwnedCritical() { }

  prepareDisease() { }
  prepareOwnedDisease() { }

  prepareInjury() { }
  prepareOwnedInjury() { }

  prepareMoney() { }
  prepareOwnedMoney() { }

  prepareMutation() { }
  prepareOwnedMutation() { }

  preparePrayer() { }
  prepareOwnedPrayer() {
    this.prepareOvercastingData()
  }

  preparePsychology() { }
  prepareOwnedPsychology() { }

  prepareTalent() { }
  prepareOwnedTalent() { 
    this.advances.indicator = this.advances.force;
   }

  prepareTrapping() { }
  prepareOwnedTrapping() { }

  prepareSkill() { }
  prepareOwnedSkill() {
    this.total.value = this.modifier.value + this.advances.value + this.characteristic.value
    this.advances.indicator = this.advances.force;
  }

  prepareSpell() {
    this._addSpellDescription();
  }
  prepareOwnedSpell() {
    this.prepareOvercastingData()
    this.cn.value = this.memorized.value ? this.cn.value : this.cn.value * 2
  }

  prepareTrait() { }
  prepareOwnedTrait() { }

  prepareWeapon() { }
  prepareOwnedWeapon() {

    
    this.qualities.value = foundry.utils.deepClone(this.data._source.data.qualities.value);
    this.flaws.value = foundry.utils.deepClone(this.data._source.data.flaws.value);
    
    if (this.attackType == "ranged" && this.ammo && this.isOwned && this.skillToUse && this.actor.type != "vehicle")
      this._addProperties(this.ammo.properties)

    if (this.weaponGroup.value == "flail" && !this.skillToUse && !this.flaws.value.find(i => i.name == "dangerous"))
      this.flaws.value.push({ name: "dangerous" })

    if (game.settings.get("wfrp4e", "mooQualities"))
    {
      game.wfrp4e.utility.logHomebrew("mooQualities")
      let momentum = this.qualities.value.find(q => q.name == "momentum" && q.value)
      if (momentum?.value && this.actor.status.advantage.value > 0)
      {
        let qualityString = momentum.value
        this._addProperties({qualities : game.wfrp4e.utility.propertyStringToObject(qualityString, game.wfrp4e.utility.allProperties()), flaws: {} } )
        this.qualities.value.splice(this.qualities.value.findIndex(q => q.name == "momentum"), 1)
      }

    }

    this.computeRangeBands()

    if (this.loading) {
      this.loaded.max = 1
      if (this.repeater) {
        this.loaded.max = this.repeater.value
        if (!this.loaded.max)
          this.loaded.max = 1
      }
    }
  }

  prepareExtendedTest() { }
  prepareOwnedExtendedTest() {
    this.SL.pct = 0;
    if (this.SL.target > 0)
      this.SL.pct = this.SL.current / this.SL.target * 100
    if (this.SL.pct > 100)
      this.SL.pct = 100
    if (this.SL.pct < 0)
      this.SL.pct = 0;
  }

  prepareVehiclemod() { }
  prepareOwnedVehiclemod() { }

  prepareCargo() {
    if (this.cargoType.value != "wine" && this.cargoType.value != "brandy")
      this.quality.value = "average"
  }
  prepareOwnedCargo() { }


  prepareOvercastingData() {
    let usage = {
      range: undefined,
      duration: undefined,
      target: undefined,
      other: undefined,
    }

    let target = this.Target
    let duration = this.Duration
    let range = this.Range

    if (parseInt(target)) {
      usage.target = {
        label: game.i18n.localize("Target"),
        count: 0,
        AoE: false,
        initial: parseInt(target) || target,
        current: parseInt(target) || target,
        unit: ""
      }
    }
    else if (target.includes("AoE")) {
      let aoeValue = target.substring(target.indexOf("(") + 1, target.length - 1)
      usage.target = {
        label: game.i18n.localize("AoE"),
        count: 0,
        AoE: true,
        initial: parseInt(aoeValue) || aoeValue,
        current: parseInt(aoeValue) || aoeValue,
        unit: aoeValue.split(" ")[1]
      }
    }
    if (parseInt(duration)) {
      usage.duration = {
        label: game.i18n.localize("Duration"),
        count: 0,
        initial: parseInt(duration) || duration,
        current: parseInt(duration) || duration,
        unit: duration.split(" ")[1]
      }
    }
    if (parseInt(range)) {
      usage.range = {
        label: game.i18n.localize("Range"),
        count: 0,
        initial: parseInt(range) || aoeValue,
        current: parseInt(range) || aoeValue,
        unit: range.split(" ")[1]
      }
    }

    if (this.overcast?.enabled) {
      let other = {
        label: this.overcast.label,
        count: 0
      }


      // Set initial overcast option to type assigned, value is arbitrary, characcteristics is based on actor data, SL is a placeholder for tests
      if (this.overcast.initial.type == "value") {
        other.initial = parseInt(this.overcast.initial.value) || 0
        other.current = parseInt(this.overcast.initial.value) || 0
      }
      else if (this.overcast.initial.type == "characteristic") {
        let char = this.actor.characteristics[this.overcast.initial.characteristic]

        if (this.overcast.initial.bonus)
          other.initial = char.bonus
        else
          other.initial = char.value

        other.current = other.initial;
      }
      else if (this.overcast.initial.type == "SL") {
        other.initial = "SL"
        other.current = "SL"
      }

      // See if overcast increments are also based on characteristics, store that value so we don't have to look it up in the roll class
      if (this.overcast.valuePerOvercast.type == "characteristic") {
        let char = this.actor.characteristics[this.overcast.valuePerOvercast.characteristic]

        if (this.overcast.valuePerOvercast.bonus)
          other.increment = char.bonus
        else
          other.increment = char.value

        //other.increment = other.initial;
      }

      usage.other = other;
    }

    this.overcast.usage = usage
  }

  //#endregion

  //#region Expand Data
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
    const data = this[`_${this.type}ExpandData`]();
    data.description.value = data.description.value || "";
    data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);
    data.targetEffects = this.effects.filter(e => e.application == "apply")
    data.invokeEffects = this.effects.filter(e => e.trigger == "invoke")
    return data;
  }

  // Trapping Expansion Data
  _trappingExpandData() {
    let data = this.toObject().data
    data.properties = [];
    return data;
  }

  // Money Expansion Data
  _moneyExpandData() {
    let data = this.toObject().data
    data.properties = [`${game.i18n.localize("ITEM.PenniesValue")}: ${this.coinValue.value}`];
    return data;
  }

  // Psychology Expansion Data
  _psychologyExpandData() {
    let data = this.toObject().data
    data.properties = [];
    return data;
  }

  // Mutation Expansion Data
  _mutationExpandData() {
    let data = this.toObject().data
    data.properties = [];
    data.properties.push(game.wfrp4e.config.mutationTypes[this.mutationType.value]);
    if (this.modifier.value)
      data.properties.push(this.modifier.value)
    return data;
  }

  // Disease Expansion Data
  _diseaseExpandData() {
    let data = this.toObject().data
    data.properties = [];
    data.properties.push(`<b>${game.i18n.localize("Contraction")}:</b> ${this.contraction.value}`);
    data.properties.push(`<b>${game.i18n.localize("Incubation")}:</b> ${this.incubation.value} ${this.incubation.unit}`);
    data.properties.push(`<b>${game.i18n.localize("Duration")}:</b> ${this.duration.value} ${this.duration.unit}`);
    data.properties = data.properties.concat(this.effects.map(i => i = "<a class ='symptom-tag'><i class='fas fa-user-injured'></i> " + i.label.trim() + "</a>").join(", "));
    if (this.permanent.value)
      data.properties.push(`<b>${game.i18n.localize("Permanent")}:</b> ${this.permanent.value}`);
    return data;
  }

  // Talent Expansion Data
  _talentExpandData() {
    let data = this.toObject().data
    data.properties = [];
    return data;
  }

  // Trait Expansion Data
  _traitExpandData() {
    let data = this.toObject().data
    data.properties = [];
    return data;
  }

  // Career Expansion Data
  _careerExpandData() {
    let data = this.toObject().data
    data.properties = [];
    data.properties.push(`<b>${game.i18n.localize("Class")}</b>: ${this.class.value}`);
    data.properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.careergroup.value}`);
    data.properties.push(game.wfrp4e.config.statusTiers[this.status.tier] + " " + this.status.standing);
    data.properties.push(`<b>${game.i18n.localize("Characteristics")}</b>: ${this.characteristics.map(i => i = " " + game.wfrp4e.config.characteristicsAbbrev[i])}`);
    data.properties.push(`<b>${game.i18n.localize("Skills")}</b>: ${this.skills.map(i => i = " " + i)}`);
    data.properties.push(`<b>${game.i18n.localize("Talents")}</b>: ${this.talents.map(i => i = " " + i)}`);
    data.properties.push(`<b>${game.i18n.localize("Trappings")}</b>: ${this.trappings.map(i => i = " " + i)}`);
    data.properties.push(`<b>${game.i18n.localize("Income")}</b>: ${this.incomeSkill.map(i => ` <a class = 'career-income' data-career-id=${this.id}> ${this.skills[i]} <i class="fas fa-coins"></i></a>`)}`);
    // When expansion data is called, a listener is added for 'career-income'
    return data;
  }

  // Injury Expansion Data
  _injuryExpandData() {
    let data = this.toObject().data
    data.properties = [];
    return data;
  }

  // Critical Expansion Data
  _criticalExpandData() {
    let data = this.toObject().data
    data.properties = [];
    data.properties.push(`<b>${game.i18n.localize("Wounds")}</b>: ${this.wounds.value}`)
    if (this.modifier.value)
      data.properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${this.modifier.value}`)
    return data;
  }

  // Spell Expansion Data
  _spellExpandData() {
    let data = this.toObject().data
    data.properties = [];
    data.properties.push(`${game.i18n.localize("Range")}: ${this.Range}`);
    let target = this.Target;
    if (target.includes("AoE"))
      target = `<a class='aoe-template'><i class="fas fa-ruler-combined"></i>${target}</a>`
    data.properties.push(`${game.i18n.localize("Target")}: ${target}`);
    data.properties.push(`${game.i18n.localize("Duration")}: ${this.Duration}`);
    if (this.magicMissile.value)
      data.properties.push(`${game.i18n.localize("Magic Missile")}: +${this.Damage}`);
    else if (this.damage.value || this.damage.dices) {
      let damage = this.Damage || "";
      if (this.damage.dice)
        damage += " + " + this.damage.dice
      data.properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
    }
    return data;
  }

  // Prayer Expansion Data
  _prayerExpandData() {
    let data = this.toObject().data
    data.properties = [];
    data.properties.push(`${game.i18n.localize("Range")}: ${this.Range}`);
    data.properties.push(`${game.i18n.localize("Target")}: ${this.Target}`);
    data.properties.push(`${game.i18n.localize("Duration")}: ${this.Duration}`);
    let damage = this.Damage || "";
    if (this.damage.dice)
      damage += " + " + this.damage.dice
    if (this.damage.addSL)
      damage += " + " + game.i18n.localize("SL") // TODO: SL?
    if (this.damage.value)
      data.properties.push(`${game.i18n.localize("Damage")}: ${this.DamageString}`);
    return data;
  }

  // Weapon Expansion Data
  _weaponExpandData() {
    let data = this.toObject().data
    let properties = [];

    if (this.weaponGroup.value)
      properties.push(game.wfrp4e.config.weaponGroups[this.weaponGroup.value]);
    if (this.range.value)
      properties.push(`${game.i18n.localize("Range")}: ${this.range.value}`);
    if (this.damage.value) {
      let damage = this.damage.value
      if (this.damage.dice)
        damage += " + " + this.damage.dice
      properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
    }
    if (this.twohanded.value)
      properties.push(game.i18n.localize("ITEM.TwoHanded"));
    if (this.reach.value)
      properties.push(`${game.i18n.localize("Reach")}: ${game.wfrp4e.config.weaponReaches[this.reach.value] + " - " + game.wfrp4e.config.reachDescription[this.reach.value]}`);
    if (this.damageToItem.value)
      properties.push(`<b>${game.i18n.localize("ITEM.WeaponDamaged")} ${this.damageToItem.value} points</b>`)
    if (this.damageToItem.shield)
      properties.push(`${game.i18n.localize("ITEM.ShieldDamaged")} ${this.damageToItem.shield} points`)

    let weaponProperties = this.qualities.value.map(i => game.wfrp4e.utility.qualityList[i.name] + " " + i.value).concat(this.flaws.value.map(i => game.wfrp4e.utility.flawList[i.name] + " " + i.value));
    for (let prop in weaponProperties)
      if (Array.isArray(weaponProperties[prop]))
        properties = properties.concat(weaponProperties[prop].map(i => i = "<a class ='item-property'>" + i + "</a>"))

    if (this.special.value)
      properties.push(`${game.i18n.localize("Special")}: ` + this.special.value);

    data.properties = properties.filter(p => !!p);
    return data;
  }

  // Armour Expansion Data
  _armourExpandData() {
    let data = this.toObject().data
    let properties = [];
    properties.push(game.wfrp4e.config.armorTypes[this.armorType.value]);
    let armourProperties = this.qualities.value.map(i => game.wfrp4e.utility.qualityList[i.name] + " " + i.value).concat(this.flaws.value.map(i => game.wfrp4e.utility.flawList[i.name] + " " + i.value));
    for (let prop in armourProperties)
      if (Array.isArray(armourProperties[prop]))
        properties = properties.concat(armourProperties[prop].map(i => i = "<a class ='item-property'>" + i + "</a>"))
    properties.push(this.penalty.value);

    data.properties = properties.filter(p => !!p);
    return data;
  }

  // Ammunition Expansion Data
  _ammunitionExpandData() {
    let data = this.toObject().data
    let properties = [];
    properties.push(game.wfrp4e.config.ammunitionGroups[this.ammunitionType.value])

    if (this.range.value)
      properties.push(`${game.i18n.localize("Range")}: ${this.range.value}`);

    if (this.damage.value) {
      let damage = this.damage.value
      if (this.damage.dice)
        damage += " + " + this.damage.dice
      properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
    }

    let ammoProperties = this.qualities.value.map(i => game.wfrp4e.utility.qualityList[i.name] + " " + i.value).concat(this.flaws.value.map(i => game.wfrp4e.utility.flawList[i.name] + " " + i.value));
    for (let prop in ammoProperties)
      if (Array.isArray(ammoProperties[prop]))
        properties = properties.concat(ammoProperties[prop].map(i => i = "<a class ='item-property'>" + i + "</a>"))

    if (this.special.value)
      properties.push(`${game.i18n.localize("Special")}: ` + this.special.value);

    data.properties = properties.filter(p => !!p);
    return data;
  }

  _vehicleModExpandData() {
    let data = this.toObject().data
    data.properties = [game.wfrp4e.config.modTypes[this.modType.value]];
    return data;
  }

  // Cargo Expansion Data
  _cargoExpandData() {
    let data = this.toObject().data
    data.properties = [];

    if (this.origin.value)
      data.properties.push(`<b>${game.i18n.localize("ITEM.Origin")}</b>: ${this.origin.value}`)

    if (game.wfrp4e.config.trade.cargoTypes)
      data.properties.push(`<b>${game.i18n.localize("ITEM.CargoType")}</b>: ${game.wfrp4e.config.trade.cargoTypes[this.cargoType.value]}`)

    if (game.wfrp4e.config.trade.qualities && (this.cargoType.value == "wine" || this.cargoType.value == "brandy"))
      data.properties.push(`<b>${game.i18n.localize("ITEM.CargoQuality")}</b>: ${game.wfrp4e.config.trade.qualities[this.quality.value]}`)

    return data;
  }
  //#endregion

  //#region Item Posting
  /**
   * Posts this item to chat.
   * 
   * postItem() prepares this item's chat data to post it to chat, setting up 
   * the image if it exists, as well as setting flags so drag+drop works.
   * 
   */
  async postItem(quantity) {
    const properties = this[`_${this.type}ChatData`]();
    let postedItem = this.toObject()
    let chatData = duplicate(postedItem);
    chatData["properties"] = properties

    //Check if the posted item should have availability/pay buttons
    chatData.hasPrice = "price" in chatData.data && this.type != "cargo";
    if (chatData.hasPrice) {
      if (!chatData.data.price.gc || isNaN(chatData.data.price.gc || 0))
        chatData.data.price.gc = 0;
      if (!chatData.data.price.ss || isNaN(chatData.data.price.ss || 0))
        chatData.data.price.ss = 0;
      if (!chatData.data.price.bp || isNaN(chatData.data.price.bp))
        chatData.data.price.bp = 0;
    }

    let dialogResult;
    if (quantity == undefined && (this.type == "weapon" || this.type == "armour" || this.type == "ammunition" || this.type == "container" || this.type == "money" || this.type == "trapping")) {
      dialogResult = await new Promise((resolve, reject) => {
        new Dialog({
          content:
          `<p>${game.i18n.localize("DIALOG.EnterQuantity")}</p>
          <div class="form-group">
            <label> ${game.i18n.localize("DIALOG.PostQuantity")}</label>
            <input style="width:100px" name="post-quantity" type="number" value="1"/>
          </div>
          <div class="form-group">
          <label> ${game.i18n.localize("DIALOG.ItemQuantity")}</label>
          <input style="width:100px" name="item-quantity" type="number" value="${this.quantity.value}"/>
        </div>
        <p>${game.i18n.localize("DIALOG.QuantityHint")}</p>
          `,
          title: game.i18n.localize("DIALOG.PostQuantity"),
          buttons: {
            post: {
              label: game.i18n.localize("Post"),
              callback: (dlg) => {
                resolve({
                  post : dlg.find('[name="post-quantity"]').val(), 
                  qty : dlg.find('[name="item-quantity"]').val()
                })
              }
            },
            inf: {
              label: game.i18n.localize("Infinite"),
              callback: (dlg) => {
                resolve({post : "inf",  qty : dlg.find('[name="item-quantity"]').val()})
              }
            },
          }
        }).render(true)
      })

      if (dialogResult.post != "inf" && (!Number.isNumeric(dialogResult.post) || parseInt(dialogResult.post) <= 0))
        return ui.notifications.error(game.i18n.localize("CHAT.PostError"))

      if (dialogResult.qty != "inf" && (!Number.isNumeric(dialogResult.qty) || parseInt(dialogResult.qty) < 0))
        return ui.notifications.error(game.i18n.localize("CHAT.PostError"))


      let totalQtyPosted = (dialogResult.post * dialogResult.qty)
      if (Number.isNumeric(totalQtyPosted)) {
        if (this.isOwned) {
          if (this.quantity.value < totalQtyPosted) {
            return ui.notifications.notify(game.i18n.format("CHAT.PostMoreThanHave"))
          }
          else {
            ui.notifications.notify(game.i18n.format("CHAT.PostQuantityReduced", { num: totalQtyPosted }));
            this.update({ "data.quantity.value": this.quantity.value - totalQtyPosted })
          }
        }
      }


      if (dialogResult.post != "inf")
        chatData.showQuantity = true
      
      chatData.postQuantity = dialogResult.post;
      postedItem.data.quantity.value = dialogResult.qty
      chatData.data.quantity.value = dialogResult.qty
    }
    else if (quantity > 0) {
      chatData.postQuantity = quantity;
      chatData.showQuantity = true;
    }

    // if (dialogResult.post != "inf" && isNaN(dialogResult.post * dialogResult.qty))
    //   return


    // Don't post any image for the item (which would leave a large gap) if the default image is used
    if (chatData.img.includes("/blank.png"))
      chatData.img = null;

    renderTemplate('systems/wfrp4e/templates/chat/post-item.html', chatData).then(html => {
      let chatOptions = WFRP_Utility.chatDataSetup(html)

      // Setup drag and drop data
      chatOptions["flags.transfer"] = JSON.stringify(
        {
          type: "postedItem",
          payload: postedItem,
        })
      chatOptions["flags.postQuantity"] = chatData.postQuantity;
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
    let properties = [
      `<b>${game.i18n.localize("ITEM.TrappingType")}</b>: ${game.wfrp4e.config.trappingCategories[this.trappingType.value]}`,
      `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
    ]
    return properties;
  }

  // Skill Chat Data
  _skillChatData() {
    let properties = []
    properties.push(this.advanced == "adv" ? `<b>${game.i18n.localize("Advanced")}</b>` : `<b>${game.i18n.localize("Basic")}</b>`)
    return properties;
  }

  // Money Chat Data
  _moneyChatData() {
    let properties = [
      `<b>${game.i18n.localize("ITEM.PenniesValue")}</b>: ${this.coinValue.value}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
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
      `<b>${game.i18n.localize("ITEM.MutationType")}</b>: ${game.wfrp4e.config.mutationTypes[this.mutationType.value]}`,
    ];
    if (this.modifier.value)
      properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${this.modifier.value}`)
    return properties;
  }

  // Disease Chat Data
  _diseaseChatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Contraction")}:</b> ${this.contraction.value}`);
    properties.push(`<b>${game.i18n.localize("Incubation")}:</b> <a class = 'chat-roll'><i class='fas fa-dice'></i> ${this.incubation.value}</a>`);
    properties.push(`<b>${game.i18n.localize("Duration")}:</b> <a class = 'chat-roll'><i class='fas fa-dice'></i> ${this.duration.value}</a>`);
    properties.push(`<b>${game.i18n.localize("Symptoms")}:</b> ${(this.symptoms.value.split(",").map(i => i = "<a class ='symptom-tag'><i class='fas fa-user-injured'></i> " + i.trim() + "</a>")).join(", ")}`);
    if (this.permanent.value)
      properties.push(`<b>${game.i18n.localize("Permanent")}:</b> ${this.permanent.value}`);
    return properties;
  }

  // Talent Chat Data
  _talentChatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Max")}: </b> ${game.wfrp4e.config.talentMax[this.max.value]}`);
    if (this.tests.value)
      properties.push(`<b>${game.i18n.localize("Tests")}: </b> ${this.tests.value}`);
    return properties;
  }

  // Trait Chat Data
  _traitChatData() {
    let properties = [];
    if (this.specification.value)
      properties.push(`<b>${game.i18n.localize("Specification")}: </b> ${this.specification.value}`);
    return properties;
  }

  // Career Chat Data
  _careerChatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Class")}</b>: ${this.class.value}`);
    properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.careergroup.value}`);
    properties.push(`<b>${game.i18n.localize("Status")}</b>: ${game.wfrp4e.config.statusTiers[this.status.tier] + " " + this.status.standing}`);
    properties.push(`<b>${game.i18n.localize("Characteristics")}</b>: ${this.characteristics.map(i => i = " " + game.wfrp4e.config.characteristicsAbbrev[i])}`);
    properties.push(`<b>${game.i18n.localize("Skills")}</b>: ${this.skills.map(i => i = " " + "<a class = 'skill-lookup'>" + i + "</a>")}`);
    properties.push(`<b>${game.i18n.localize("Talents")}</b>: ${this.talents.map(i => i = " " + "<a class = 'talent-lookup'>" + i + "</a>")}`);
    properties.push(`<b>${game.i18n.localize("Trappings")}</b>: ${this.trappings.map(i => i = " " + i)}`);
    properties.push(`<b>${game.i18n.localize("Income")}</b>: ${this.incomeSkill.map(i => " " + this.skills[i])}`);
    return properties;
  }

  // Injury Chat Data
  _injuryChatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Location")}</b>: ${this.location.value}`);
    if (this.penalty.value)
      properties.push(`<b>${game.i18n.localize("Penalty")}</b>: ${this.penalty.value}`);
    return properties;
  }

  // Critical Chat Data
  _criticalChatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Wounds")}</b>: ${this.wounds.value}`);
    properties.push(`<b>${game.i18n.localize("Location")}</b>: ${this.location.value}`);
    if (this.modifier.value)
      properties.push(`<b>${game.i18n.localize("Modifier")}</b>: ${this.modifier.value}`);
    return properties;
  }

  // Spell Chat Data
  _spellChatData() {
    let properties = [];
    if (game.wfrp4e.config.magicLores[this.lore.value])
      properties.push(`<b>${game.i18n.localize("Lore")}</b>: ${game.wfrp4e.config.magicLores[this.lore.value]}`);
    else
      properties.push(`<b>${game.i18n.localize("Lore")}</b>: ${this.lore.value}`);
    properties.push(`<b>${game.i18n.localize("CN")}</b>: ${this.cn.value}`);
    properties.push(`<b>${game.i18n.localize("Range")}</b>: ${this.range.value}`);
    properties.push(`<b>${game.i18n.localize("Target")}</b>: ${this.target.value}`);
    properties.push(`<b>${game.i18n.localize("Duration")}</b>: ${this.duration.value}`);
    if (this.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${this.damage.value}`);

    return properties;
  }

  // Prayer Chat Data
  _prayerChatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Range")}</b>: ${this.range.value}`);
    properties.push(`<b>${game.i18n.localize("Target")}</b>: ${this.target.value}`);
    properties.push(`<b>${game.i18n.localize("Duration")}</b>: ${this.duration.value}`);
    if (this.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${this.damage.value}`);
    return properties;
  }

  // Container Chat Data
  _containerChatData() {
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc} GC, ${this.price.ss} SS, ${this.price.bp} BP`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
    ]

    properties.push(`<b>${game.i18n.localize("Wearable")}</b>: ${(this.wearable.value ? game.i18n.localize("Yes") : game.i18n.localize("No"))}`);
    properties.push(`<b>${game.i18n.localize("ITEM.CountOwnerEnc")}</b>: ${(this.countEnc.value ? game.i18n.localize("Yes") : game.i18n.localize("No"))}`);
    return properties;
  }

  // Weapon Chat Data
  _weaponChatData() {
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
    ]

    if (this.weaponGroup.value)
      properties.push(`<b>Group</b>: ${game.wfrp4e.config.weaponGroups[this.weaponGroup.value]}`);
    if (this.range.value)
      properties.push(`<b>${game.i18n.localize("Range")}</b>: ${this.range.value}`);
    if (this.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${this.damage.value}`);
    if (this.twohanded.value)
      properties.push(`<b>${game.i18n.localize("ITEM.TwoHanded")}</b>`);
    if (this.reach.value)
      properties.push(`<b>${game.i18n.localize("Reach")}</b>: ${game.wfrp4e.config.weaponReaches[this.reach.value] + " - " + game.wfrp4e.config.reachDescription[this.reach.value]}`);
    if (this.damageToItem.value)
      properties.push(`<b>${game.i18n.localize("ITEM.WeaponDamaged")} ${this.damageToItem.value} points</b>`)
    if (this.damageToItem.shield)
      properties.push(`${game.i18n.localize("ITEM.ShieldDamaged")} ${this.damageToItem.shield} points`)

    // Make qualities and flaws clickable
    if (this.qualities.value.length)
      properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${this.OriginalQualities.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);

    if (this.flaws.value.length)
      properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${this.OriginalFlaws.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);


    properties = properties.filter(p => p != game.i18n.localize("Special"));
    if (this.special.value)
      properties.push(`<b>${game.i18n.localize("Special")}</b>: ` + this.special.value);

    properties = properties.filter(p => !!p);
    return properties;
  }

  // Armour Chat Data
  _armourChatData() {
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
    ]

    if (this.armorType.value)
      properties.push(`<b>${game.i18n.localize("ITEM.ArmourType")}</b>: ${game.wfrp4e.config.armorTypes[this.armorType.value]}`);
    if (this.penalty.value)
      properties.push(`<b>${game.i18n.localize("Penalty")}</b>: ${this.penalty.value}`);


    for (let apVal in this.currentAP) {
      if (this.currentAP[apVal] == -1)
        this.currentAP[apVal] = this.maxAP[apVal];
    }

    for (let loc in game.wfrp4e.config.locations)
      if (this.maxAP[loc])
        properties.push(`<b>${game.wfrp4e.config.locations[loc]} AP</b>: ${this.currentAP[loc]}/${this.maxAP[loc]}`);



    // Make qualities and flaws clickable
    if (this.qualities.value.length)
      properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${this.OriginalQualities.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);

    if (this.flaws.value.length)
      properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${this.OriginalFlaws.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);


    properties = properties.filter(p => p != game.i18n.localize("Special"));
    if (this.special.value)
      properties.push(`<b>${game.i18n.localize("Special")}</b>: ` + this.special.value);

    properties = properties.filter(p => !!p);
    return properties;
  }

  // Ammunition Chat Data
  _ammunitionChatData() {
    let properties = [
      `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
      `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
    ]
    
    properties.push(`<b>${game.i18n.localize("ITEM.AmmunitionType")}:</b> ${game.wfrp4e.config.ammunitionGroups[this.ammunitionType.value]}`)

    if (this.range.value)
      properties.push(`<b>${game.i18n.localize("Range")}</b>: ${this.range.value}`);

    if (this.damage.value)
      properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${this.damage.value}`);

    // Make qualities and flaws clickable
    if (this.qualities.value.length)
      properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${this.OriginalQualities.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);

    if (this.flaws.value.length)
      properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${this.OriginalFlaws.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);


    properties = properties.filter(p => p != game.i18n.localize("Special"));
    if (this.special.value)
      properties.push(`<b>${game.i18n.localize("Special")}</b>: ` + this.special.value);

    properties = properties.filter(p => !!p);
    return properties;
  }


  _extendedTestChatData() {
    let properties = [];
    let pct = 0;
    if (this.SL.target > 0)
      pct = this.SL.current / this.SL.target * 100
    if (pct > 100)
      pct = 100
    if (pct < 0)
      pct = 0;
    properties.push(`<b>${game.i18n.localize("Test")}</b>: ${this.test.value}`)
    if (!this.hide.test && !this.hide.progress)
      properties.push(`<div class="test-progress">
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${pct}%"></div>
      </div>
      <span><a class="extended-SL">${this.SL.current}</a> / ${this.SL.target} SL</span>
    </div>`)

    return properties;
  }

  _vehicleModChatData() {
    let properties = [
      `<b>${game.i18n.localize("VEHICLE.ModType")}</b>: ${game.wfrp4e.config.modTypes[this.modType.value]}`,
      `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
      `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
    ]
    return properties
  }

  // Trapping Chat Data
  _cargoChatData() {
    let properties = []

    if (this.origin.value)
      properties.push(`<b>${game.i18n.localize("ITEM.Origin")}</b>: ${this.origin.value}`)

    if (game.wfrp4e.config.trade.cargoTypes)
      properties.push(`<b>${game.i18n.localize("ITEM.CargoType")}</b>: ${game.wfrp4e.config.trade.cargoTypes[this.cargoType.value]}`)

    if (game.wfrp4e.config.trade.qualities && (this.cargoType.value == "wine" || this.cargoType.value == "brandy"))
      properties.push(`<b>${game.i18n.localize("ITEM.CargoQuality")}</b>: ${game.wfrp4e.config.trade.qualities[this.quality.value]}`)
    return properties;
  }

  //#endregion

  //#region Item Data Computation

  applyAmmoMods(value, type) {

    if (!this.ammo)
      return value

    let ammoValue = this.ammo[type].value

    if (!ammoValue)
      return value

    // If range modification was handwritten, process it
    if (ammoValue.toLowerCase() == game.i18n.localize("as weapon")) { }
    else if (ammoValue.toLowerCase() == "as weapon") { }
    // Do nothing to weapon's range
    else if (ammoValue.toLowerCase() == game.i18n.localize("half weapon"))
      value /= 2;
    else if (ammoValue.toLowerCase() == "half weapon")
      value /= 2;
    else if (ammoValue.toLowerCase() == game.i18n.localize("third weapon"))
      value /= 3;
    else if (ammoValue.toLowerCase() =="third weapon")
      value /= 3;
    else if (ammoValue.toLowerCase() == game.i18n.localize("quarter weapon"))
      value /= 4;
    else if (ammoValue.toLowerCase() == "quarter weapon")
      value /= 4;
    else if (ammoValue.toLowerCase() == game.i18n.localize("twice weapon"))
      value *= 2;
    else if (ammoValue.toLowerCase() == "twice weapon")
      value *= 2;
    else // If the range modification is a formula (supports +X -X /X *X)
    {
      try // Works for + and -
      {
        ammoValue = eval(ammoValue);
        value = Math.floor(eval(value + ammoValue));
      }
      catch // if *X and /X
      {                                      // eval (50 + "/5") = eval(50/5) = 10
        value = Math.floor(eval(value + ammoRange));
      }
    }
    return value
  }

  /**
   * Turns a formula into a processed string for display
   * 
   * Turns a spell attribute such as "Willpower Bonus Rounds" into a more user friendly, processed value
   * such as "4 Rounds". If the aoe is checked, it wraps the result in AoE (Result).
   * 
   * @param   {String}  formula   Formula to process - "Willpower Bonus Rounds" 
   * @param   {boolean} aoe       Whether or not it's calculating AoE (changes string return)
   * @returns {String}  formula   processed formula
   */
  computeSpellPrayerFormula(type, aoe = false, formulaOverride) {
    try {

    let formula = formulaOverride || this[type]?.value
    if (Number.isNumeric(formula))
      return formula

    formula = formula.toLowerCase();

    // Do not process these special values
    if (formula != game.i18n.localize("You").toLowerCase() && formula != game.i18n.localize("Special").toLowerCase() && formula != game.i18n.localize("Instant").toLowerCase()) {
      // Iterate through characteristics
      for (let ch in this.actor.characteristics) {
        // If formula includes characteristic name
        if (formula.includes(game.wfrp4e.config.characteristics[ch].toLowerCase())) {
          // Determine if it's looking for the bonus or the value
          if (formula.includes('bonus'))
            formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase().concat(" bonus"), this.actor.characteristics[ch].bonus);
          else
            formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase(), this.actor.characteristics[ch].value);
        }
      }
    }

    // If AoE - wrap with AoE ( )
    if (aoe)
      formula = "AoE (" + formula.capitalize() + ")";

    return formula.capitalize();
    }
    catch(e)
    {
      console.log("Error computing spell or prayer formulua: " + this.name)
      return 0
    }

  }

  /**
 * Turns a formula into a processed string for display
 * 
 * Processes damage formula based - same as calculateSpellAttributes, but with additional
 * consideration to whether its a magic missile or not
 * 
 * @param   {String}  formula         Formula to process - "Willpower Bonus + 4" 
 * @param   {boolean} isMagicMissile  Whether or not it's a magic missile - used in calculating additional damage
 * @returns {String}  Processed formula
 */
  computeSpellDamage(formula, isMagicMissile) {
    try {

      formula = formula.toLowerCase();

      if (isMagicMissile) // If it's a magic missile, damage includes willpower bonus
      {
        formula += "+ " + this.actor.characteristics["wp"].bonus
      }

      // Iterate through characteristics
      for (let ch in this.actor.characteristics) {
        // If formula includes characteristic name
        while (formula.includes(game.i18n.localize(this.actor.characteristics[ch].label).toLowerCase())) {
          // Determine if it's looking for the bonus or the value
          if (formula.includes('bonus'))
            formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase().concat(" bonus"), this.actor.characteristics[ch].bonus);
          else
            formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase(), this.actor.characteristics[ch].value);
        }
      }

      return eval(formula);
    }
    catch (e) {
      throw ui.notifications.error(game.i18n.format("ERROR.ParseSpell"))
    }
  }


  /**
   * Calculates a weapon's range or damage formula.
   * 
   * Takes a weapon formula for Damage or Range (SB + 4 or SBx3) and converts to a numeric value.
   * 
   * @param {String} formula formula to be processed (SBx3 => 9).
   * 
   * @return {Number} Numeric formula evaluation
   */
  computeWeaponFormula(type, mount) {
    let formula = this[type].value || 0
    let actorToUse = this.actor
    try {
      formula = formula.toLowerCase();
      // Iterate through characteristics
      for (let ch in this.actor.characteristics) {
        if (ch == "s" && mount)
          actorToUse = mount
        else
          actorToUse = this.actor
        // Determine if the formula includes the characteristic's abbreviation + B (SB, WPB, etc.)
        if (formula.includes(ch.concat('b'))) {
          // Replace that abbreviation with the Bonus value
          formula = formula.replace(ch.concat('b'), actorToUse.characteristics[ch].bonus.toString());
        }
      }
      // To evaluate multiplication, replace x with *
      formula = formula.replace('x', '*');

      return eval(formula);
    }
    catch
    {
      return formula
    }
  }

  computeRangeBands() {

    let range = this.Range
    if (!range || this.attackType == "melee")
      return

    let rangeBands = {}

    rangeBands[`"${game.i18n.localize("Point Blank")}"`] = {
      range: [0, Math.ceil(range / 10)],
      modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Point Blank"]],
      difficulty : game.wfrp4e.config.rangeModifiers["Point Blank"]
    }
    rangeBands[`"${game.i18n.localize("Short Range")}"`] = {
      range: [Math.ceil(range / 10) + 1, Math.ceil(range / 2)],
      modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Short Range"]],
      difficulty : game.wfrp4e.config.rangeModifiers["Short Range"]
    }
    rangeBands[`"${game.i18n.localize("Normal")}"`] = {
      range: [Math.ceil(range / 2) + 1, range],
      modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Normal"]],
      difficulty : game.wfrp4e.config.rangeModifiers["Normal"]
    }
    rangeBands[`"${game.i18n.localize("Long Range")}"`] = {
      range: [range + 1, range * 2],
      modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Long Range"]],
      difficulty : game.wfrp4e.config.rangeModifiers["Long Range"]
    }
    rangeBands[`"${game.i18n.localize("Extreme")}"`] = {
      range: [range * 2 + 1, range * 3],
      modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Extreme"]],
      difficulty : game.wfrp4e.config.rangeModifiers["Extreme"]
    }

    //@HOUSE
    if (game.settings.get("wfrp4e", "mooRangeBands"))
    {
      game.wfrp4e.utility.logHomebrew("mooRangeBands")
      if (!this.getFlag("wfrp4e", "optimalRange"))
        game.wfrp4e.utility.log("Warning: No Optimal Range set for " + this.name)

      rangeBands[`"${game.i18n.localize("Point Blank")}"`].modifier = game.wfrp4e.utility.optimalDifference(this, game.i18n.localize("Point Blank")) * -20 + 20
      delete rangeBands[`"${game.i18n.localize("Point Blank")}"`].difficulty
      rangeBands[`"${game.i18n.localize("Short Range")}"`].modifier = game.wfrp4e.utility.optimalDifference(this, game.i18n.localize("Short Range")) * -20 + 20
      delete rangeBands[`"${game.i18n.localize("Short Range")}"`].difficulty
      rangeBands[`"${game.i18n.localize("Normal")}"`].modifier = game.wfrp4e.utility.optimalDifference(this, game.i18n.localize("Normal")) * -20 + 20
      delete rangeBands[`"${game.i18n.localize("Normal")}"`].difficulty
      rangeBands[`"${game.i18n.localize("Long Range")}"`].modifier = game.wfrp4e.utility.optimalDifference(this, game.i18n.localize("Long Range")) * -20 + 20
      delete rangeBands[`"${game.i18n.localize("Long Range")}"`].difficulty
      rangeBands[`"${game.i18n.localize("Extreme")}"`].modifier = game.wfrp4e.utility.optimalDifference(this, game.i18n.localize("Extreme")) * -20 + 20
      delete rangeBands[`"${game.i18n.localize("Extreme")}"`].difficulty
    }
    //@/HOUSE


    if (this.weaponGroup.value == "entangling") {
      rangeBands[`"${game.i18n.localize("Point Blank")}"`].modifier = 0
      rangeBands[`"${game.i18n.localize("Short Range")}"`].modifier = 0
      rangeBands[`"${game.i18n.localize("Normal")}"`].modifier = 0
      rangeBands[`"${game.i18n.localize("Long Range")}"`].modifier = 0
      rangeBands[`"${game.i18n.localize("Extreme")}"`].modifier = 0
    }

    this.range.bands = rangeBands;

  }


  //#endregion
  /**
     * 
     * @param {Object} properties properties object to add
     */
  _addProperties(properties) {
    let qualities = this.qualities.value;
    let flaws = this.flaws.value;

    for (let q in properties.qualities) {
      let hasQuality = qualities.find(quality => quality.name == q)
      if (hasQuality && properties.qualities[q].value) {
        hasQuality.value += properties.qualities[q].value
      }
      else
        qualities.push({ name: q, value: properties.qualities[q].value })
    }
    for (let f in properties.flaws) {
      let hasQuality = flaws.find(flaw => flaw.name == f)
      if (hasQuality && properties.flaws[f].value) {
        hasQuality.value += properties.flaws[f].value
      }
      else
        flaws.push({ name: f, value: properties.flaws[f].value })
    }
  }

  static _propertyArrayToObject(array, propertyObject)
  {

    let properties = {}

    // Convert quality/flaw arry into an properties object (accessible example `item.properties.qualities.accurate` or `item.properties.flaws.reload.value)
    if (array) {
      array.forEach(p => {
        if (propertyObject[p.name]) {
          properties[p.name] = {
            key: p.name,
            display: propertyObject[p.name],
            value: p.value
          }
          if (p.value)
            properties[p.name].display += " " + (Number.isNumeric(p.value) ? p.value : `(${p.value})`)

        }
        // Unrecognized
        else properties[p.name] = {
          key: p.name,
          display: p.name
        }
      })
    }

    return properties
  }

  _addAPLayer(AP) {
    // If the armor protects a certain location, add the AP value of the armor to the AP object's location value
    // Then pass it to addLayer to parse out important information about the armor layer, namely qualities/flaws
    for (let loc in this.maxAP) {
      if (this.maxAP[loc] > 0) {
        AP[loc].value += this.currentAP[loc];
        if (this.currentAP[loc] < this.maxAP[loc])
        {
          this.damaged[loc] = true
          AP[loc].damaged = this.maxAP[loc] - this.currentAP[loc]
        }

        let layer = {
          value: this.currentAP[loc],
          armourType: this.armorType.value // used for sound
        }

        let properties = this.properties
        layer.impenetrable = !!properties.qualities.impenetrable;
        layer.partial = !!properties.flaws.partial;
        layer.weakpoints = !!properties.flaws.weakpoints;

        if (this.armorType.value == "plate" || this.armorType.value == "mail")
          layer.metal = true;

        AP[loc].layers.push(layer);
      }
    }
  }

  _addCareerData(career) {
    if (!career)
      return


    this.advances.career = this;
    if (this.type == "skill") {
      if (this.advances.value >= career.level.value * 5)
        this.advances.complete = true;
    }
    this.advances.indicator = this.advances.indicator || !!this.advances.career || false
  }

  /**
 * Augments the spell item's description with the lore effect
 * 
 * The spell's lore is added at the end of the spell's description for
 * an easy reminder. However, this causes issues because we don't want
 * the lore to be 'saved' in the description. So we append the lore
 * if it does not already exist
 * 
 * @param {Object} spell 'spell' type item
 */
  _addSpellDescription() {
    let description = this.description.value;
    if (description && description.includes(game.i18n.localize("SPELL.Lore")))
      return description

    // Use lore override if it exists
    if (this.lore.effect)
      description += `<p>\n\n <b>${game.i18n.localize("SPELL.Lore")}</b> ${this.lore.effect}<p>`;
    // Otherwise, use config value for lore effect
    else if (game.wfrp4e.config.loreEffectDescriptions && game.wfrp4e.config.loreEffectDescriptions[this.lore.value])
      description += `<p>\n\n <b>${game.i18n.localize("SPELL.Lore")}</b> ${game.wfrp4e.config.loreEffectDescriptions[this.lore.value]}<p>`;

    this.description.value = description
  }


  //#region Condition Handling
  async addCondition(effect, value = 1) {
    if (typeof (effect) === "string")
      effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"


    let existing = this.hasCondition(effect.id)

    if (existing && existing.flags.wfrp4e.value == null)
      return existing
    else if (existing) {
      existing = duplicate(existing)
      existing.flags.wfrp4e.value += value;
      return this.updateEmbeddedDocuments("ActiveEffect", [existing])
    }
    else if (!existing) {
      effect.label = game.i18n.localize(effect.label);
      if (Number.isNumeric(effect.flags.wfrp4e.value))
        effect.flags.wfrp4e.value = value;
      effect["flags.core.statusId"] = effect.id;
      delete effect.id
      return this.createEmbeddedDocuments("ActiveEffect", [effect])
    }
  }

  async removeCondition(effect, value = 1) {
    if (typeof (effect) === "string")
      effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"

    let existing = this.hasCondition(effect.id)



    if (existing && existing.flags.wfrp4e.value == null)
      return this.deleteEmbeddedDocuments("ActiveEffect", [existing._id])
    else if (existing) {
      existing.flags.wfrp4e.value -= value;

      if (existing.flags.wfrp4e.value <= 0)
        return this.deleteEmbeddedDocuments("ActiveEffect", [existing._id])
      else
        return this.updateEmbeddedDocuments("ActiveEffect", [existing])
    }
  }


  hasCondition(conditionKey) {
    let existing = this.effects.find(i => i.statusId == conditionKey)
    return existing
  }
  //#endregion

  //#region Getters
  // @@@@@@@ BOOLEAN GETTERS @@@@@@
  get isMelee() {
    return this.modeOverride?.value == "melee" || (game.wfrp4e.config.groupToType[this.weaponGroup.value] == "melee" && this.modeOverride?.value != "ranged")
  }

  get isRanged() {
    return this.modeOverride?.value == "ranged" || (game.wfrp4e.config.groupToType[this.weaponGroup.value] == "ranged" && this.modeOverride?.value != "melee")
  }

  get isEquipped() {
    if (this.type == "armour" || this.type == "container")
      return !!this.worn.value
    else if (this.type == "weapon")
      return !!this.equipped
    else if (this.type == "trapping" && this.trappingType.value == "clothingAccessories")
      return !!this.worn
  }

  // @@@@@@@ FORMATTED GETTERS @@@@@@
  get WeaponGroup() {
    return game.wfrp4e.config.weaponGroups[this.weaponGroup.value]
  }

  get Reach() {
    return game.wfrp4e.config.weaponReaches[this.reach.value];
  }

  get Max() {
    switch (this.max.value) // Turn its max value into "numMax", which is an actual numeric value
    {
      case '1':
        return 1;

      case '2':
        return 2;

      case '3':
        return 3;

      case '4':
        return 4;

      case 'none':
        return "-";

      default:
        return this.actor.characteristics[this.max.value].bonus;
    }
  }

  get DisplayName() {
    return this.specification.value ? this.name + " (" + this.Specification + ")" : this.name;
  }

  // @@@@@@@ COMPUTED GETTERS @@@@@
  get attackType() {
    if (this.type == "weapon")
      return this.modeOverride?.value || game.wfrp4e.config.groupToType[this.weaponGroup.value]
    else if (this.type == "trait" && this.rollable.damage)
      return this.rollable.attackType
  }

  get cost() {
    if (this.type == "talent")
      return (this.Advances + 1) * 100
    else if (this.type == "skill") {
      return WFRP_Utility._calculateAdvCost(this.advances.value, "skill", this.advances.costModifier)
    }
  }

  get included() {
    return !((this.actor.excludedTraits || []).includes(this.id))
  }

  
  get reachNum() {
    return game.wfrp4e.config.reachNum[this.reach.value]
  }

  get ammo() {
    if (this.attackType == "ranged" && this.currentAmmo.value && this.isOwned)
      return this.actor.items.get(this.currentAmmo.value)
  }

  get ammoList() {
    return this.actor.getItemTypes("ammunition").filter(a => a.ammunitionType.value == this.ammunitionGroup.value)
  }


  get ingredient() {
    if (this.currentIng.value)
      return this.actor.items.get(this.currentIng.value)
  }

  get ingredientList() {
    return this.actor.getItemTypes("trapping").filter(t => t.trappingType.value == "ingredient" && t.spellIngredient.value == this.id)
  }

  get skillToUse() {
    let skills = this.actor.getItemTypes("skill")
    let skill
    if (this.type == "weapon") {
      skill = skills.find(x => x.name.toLowerCase() == this.skill.value.toLowerCase())
      if (!skill)
        skill = skills.find(x => x.name.toLowerCase().includes(`(${this.WeaponGroup.toLowerCase()})`))
    }
    if (this.type == "spell")
      skill = skills.find(i => i.name.toLowerCase() == `${game.i18n.localize("Language")} (${game.i18n.localize("Magick")})`.toLowerCase())

    if (this.type == "prayer")
      skill = skills.find(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase())

    if (this.type == "trait" && this.rollable.value && this.rollable.skill)
      skill = skills.find(i => i.name == this.rollable.skill)

    return skill
  }

  get loading() {
    return this.properties.flaws.reload
  }

  get repeater() {
    return this.properties.qualities.repeater
  }

  get reloadingTest() {
    return this.actor.items.get(getProperty(this.data, "flags.wfrp4e.reloading"))
  }

  get protects() {
    let protects = {}
    for (let loc in this.maxAP) {
      if (this.maxAP[loc] > 0)
        protects[loc] = true
      else
        protects[loc] = false
    }
    return protects
  }

  get properties() {

    let properties = {
      qualities : ItemWfrp4e._propertyArrayToObject(this.qualities.value, game.wfrp4e.utility.qualityList()),
      flaws: ItemWfrp4e._propertyArrayToObject(this.flaws.value, game.wfrp4e.utility.flawList()),
      unusedQualities: {}
    }

    if (this.type == "weapon" && this.isOwned && !this.skillToUse && this.actor.type != "vehicle") {
      properties.unusedQualities = properties.qualities
      properties.qualities = {}
      if (this.ammo)
        properties.qualities = this.ammo.properties.qualities
    }



    properties.special = this.special.value
    if (this.ammo)
      properties.specialAmmo = this.ammo.properties.special

    return properties;
  }

  // For Item Sheets - properties before modifications
  get originalProperties() {
    let properties = {
      qualities : ItemWfrp4e._propertyArrayToObject(this.data._source.data.qualities.value, game.wfrp4e.utility.qualityList()),
      flaws: ItemWfrp4e._propertyArrayToObject(this.data._source.data.flaws.value, game.wfrp4e.utility.flawList()),
      unusedQualities: {}
    }
    return properties;
  }


  get skillModified() {
    if (this.modifier) {
      if (this.modifier.value > 0)
        return "positive";
      else if (this.modifier.value < 0)
        return "negative"
    }
    return ""
  }

  get Advances() {
    if (this.isOwned) {
      let talents = this.actor.getItemTypes("talent")
      return talents.filter(i => i.name == this.name).reduce((prev, current) => prev += current.advances.value, 0)
    }
    else {
      return this.advances.value
    }
  }

  get Qualities() {
    return Object.values(this.properties.qualities).map(q => q.display)
  }

  get UnusedQualities() {
    return Object.values(this.properties.unusedQualities).map(q => q.display)
  }

  get Flaws() {
    return Object.values(this.properties.flaws).map(f => f.display)
  }

  get OriginalQualities() {
    return Object.values(this.originalProperties.qualities).map(q => q.display)
  }

  get OriginalFlaws() {
    return Object.values(this.originalProperties.flaws).map(f => f.display)
  }

  get Target() {
    return this.computeSpellPrayerFormula("target", this.target.aoe)
  }

  get Duration() {
    let duration = this.computeSpellPrayerFormula("duration", this.range.aoe)
    if (this.duration.extendable)
      duration += "+"
    return duration
  }

  get Range() {
    if (this.type == "spell" || this.type == "prayer")
      return this.computeSpellPrayerFormula("range")
    else if (this.type == "weapon")
      return this.applyAmmoMods(this.computeWeaponFormula("range"), "range")
  }

  get Damage() {
    let damage    
    if (this.type == "spell")
      damage = this.computeSpellDamage(this.damage.value, this.magicMissile.value)
    else if (this.type == "prayer")
      damage = this.computeSpellDamage(this.damage.value, false)
    else if (this.type == "weapon")
      damage = this.applyAmmoMods(this.computeWeaponFormula("damage"), "damage") + (this.actor.data.flags[`${this.attackType}DamageIncrease`] || 0) - this.damageToItem.value
    else if (this.type == "trait" && this.rollable.damage)
      damage = this.Specification


    //@HOUSE
    if (game.settings.get("wfrp4e", "mooSizeDamage") && this.actor.sizeNum > 3)
    {
      if ((this.type == "weapon" && this.damage.value.includes("SB")) || (this.type =="trait" && this.rollable.bonusCharacteristic == "s"))
      {
        game.wfrp4e.utility.logHomebrew("mooSizeDamage")
        let SBsToAdd = this.actor.sizeNum - 3
        damage += (this.actor.characteristics.s.bonus * SBsToAdd)
      }

    }
    //@/HOUSE
    
    return parseInt(damage || 0)
  }

  get DamageString() {
    let string = ""
    if (this.type == "weapon") {
      string += this.Damage
    }

    if (this.damage.dice)
      string += `+ ${this.damage.dice}`

    if (this.ammo && this.ammo.damage.dice)
      string += `+ ${this.ammo.damage.dice}`

    return string
  }

  get mountDamage() {

    if (this.attackType != "melee" || !this.actor.isMounted || !this.actor.mount)
      return this.Damage

    if (this.type == "weapon")
      return this.applyAmmoMods(this.computeWeaponFormula("damage", this.actor.mount), "damage") + (this.actor.data.flags[`${this.attackType}DamageIncrease`] || 0) - this.damageToItem.value

    if (this.type == "trait" && this.rollable.bonusCharacteristic == "s") {
      return this.Damage + (this.actor.mount.characteristics[this.rollable.bonusCharacteristic].bonus - this.actor.characteristics[this.rollable.bonusCharacteristic].bonus)
    }
    else
      return this.Damage


  }


  get Specification() {
    let specification
    if (this.specification.value) {
      if (this.rollable.bonusCharacteristic)  // Bonus characteristic adds to the specification (Weapon +X includes SB for example)
      {
        specification = parseInt(this.specification.value) || 0
        specification += this.actor.characteristics[this.rollable.bonusCharacteristic].bonus;

      }
      else
        specification = this.specification.value
    }
    return specification
  }

  get SpecificationBonus() {
    return this.actor.characteristics[this.rollable.bonusCharacteristic].bonus
  }

  // @@@@@@@ DATA GETTERS @@@@@@@
  get advanced() { return this.data.data.advanced }
  get advances() { return this.data.data.advances }
  get ammunitionGroup() { return this.data.data.ammunitionGroup }
  get ammunitionType() { return this.data.data.ammunitionType }
  get armorType() { return this.data.data.armorType }
  get availability() { return this.data.data.availability }
  get career() { return this.data.data.career }
  get careergroup() { return this.data.data.careergroup }
  get cargoType() { return this.data.data.cargoType }
  get carries() { return this.data.data.carries }
  get characteristic() {
    if (!this.isOwned)
      return this.data.data.characteristic
    let char
    if (this.type == "skill") {
      char = this.actor.characteristics[this.data.data.characteristic.value]
      char.key = this.data.data.characteristic.value
    }
    if (this.type == "trait" && this.rollable.value) {
      char = this.actor.characteristics[this.data.data.rollable.rollCharacteristic]
      char.key = this.data.data.rollable.rollCharacteristic
    }
    return char

  }
  get characteristics() { return this.data.data.characteristics }
  get class() { return this.data.data.class }
  get cn() { return this.data.data.cn }
  get coinValue() { return this.data.data.coinValue }
  get complete() { return this.data.data.complete }
  get completion() { return this.data.data.completion }
  get consumesAmmo() { return this.data.data.consumesAmmo }
  get contraction() { return this.data.data.contraction }
  get countEnc() { return this.data.data.countEnc }
  get current() { return this.data.data.current }
  get currentAmmo() { return this.data.data.currentAmmo }

  // Convert -1 (indicator for max AP) to the max AP value
  get currentAP() {
    let currentAP = foundry.utils.deepClone(this.data.data.currentAP)
    for (let loc in currentAP) {
      if (currentAP[loc] == -1)
        currentAP[loc] = this.maxAP[loc]
    }
    return currentAP
  }

  get currentIng() { return this.data.data.currentIng }
  get damage() { return this.data.data.damage }
  get damageToItem() { return this.data.data.damageToItem }
  get description() { return this.data.data.description }
  get duration() { return this.data.data.duration }
  get encumbrance() { return this.data.data.encumbrance }
  get equipped() { return this.data.data.equipped }
  get failingDecreases() { return this.data.data.failingDecreases }
  get flaws() { return this.data.data.flaws }
  get gmdescription() { return this.data.data.gmdescription }
  get god() { return this.data.data.god }
  get grouped() { return this.data.data.grouped }
  get hide() { return this.data.data.hide }
  get incomeSkill() { return this.data.data.incomeSkill }
  get incubation() { return this.data.data.incubation }
  get ingredients() { return this.data.data.ingredients }
  get level() { return this.data.data.level }
  get loaded() { return this.data.data.loaded }
  get location() { return this.data.data.location }
  get lore() { return this.data.data.lore }
  get magicMissile() { return this.data.data.magicMissile }
  get max() { return this.data.data.max }
  get maxAP() { return this.data.data.maxAP }
  get memorized() { return this.data.data.memorized }
  get modeOverride() { return this.data.data.modeOverride }
  get modifier() { return this.data.data.modifier }
  get modifiesSkills() { return this.data.data.modifiesSkills }
  get modType() { return this.data.data.modType }
  get mutationType() { return this.data.data.mutationType }
  get negativePossible() { return this.data.data.negativePossible }
  get offhand() { return this.data.data.offhand }
  get origin() { return this.data.data.origin }
  get overcast() { return this.data.data.overcast }
  get penalty() { return this.data.data.penalty }
  get permanent() { return this.data.data.permanent }
  get price() { return this.data.data.price }
  get qualities() { return this.data.data.qualities }
  get quality() { return this.data.data.quality }
  get quantity() { return this.data.data.quantity }
  get range() { return this.data.data.range }
  get reach() { return this.data.data.reach }
  get rollable() { return this.data.data.rollable }
  get skill() { return this.data.data.skill }
  get skills() { return this.data.data.skills }
  get SL() { return this.data.data.SL }
  get special() { return this.data.data.special }
  get specification() { return this.data.data.specification }
  get spellIngredient() { return this.data.data.spellIngredient }
  get status() { return this.data.data.status }
  get symptoms() { return this.data.data.symptoms }
  get talents() { return this.data.data.talents }
  get target() { return this.data.data.target }
  get test() { return this.data.data.test }
  get tests() { return this.data.data.tests }
  get total() { return this.data.data.total }
  get trappings() { return this.data.data.trappings }
  get trappingType() { return this.data.data.trappingType }

  // Used for item category display when in a container
  get trappingCategory() {
    if (this.type == "trapping")
      return game.wfrp4e.config.trappingCategories[this.trappingType.value];
    else
      return game.wfrp4e.config.trappingCategories[this.type];
  }
  get twohanded() { return this.data.data.twohanded }
  get prayerType() { return this.data.data.type }
  get unitPrice() { return this.data.data.unitPrice }
  get weaponGroup() { return this.data.data.weaponGroup || "basic" }
  get wearable() { return this.data.data.wearable }
  get wind() { return this.data.data.wind }
  get worn() { return this.data.data.worn }
  get wounds() { return this.data.data.wounds }
  //#endregion


    /**
   * Transform the Document data to be stored in a Compendium pack.
   * Remove any features of the data which are world-specific.
   * This function is asynchronous in case any complex operations are required prior to exporting.
   * @param {CompendiumCollection} [pack]   A specific pack being exported to
   * @return {object}                       A data object of cleaned data suitable for compendium import
   * @memberof ClientDocumentMixin#
   * @override - Retain ID
   */
  toCompendium(pack) {
    let data = super.toCompendium(pack)
    data._id = this.id; // Replace deleted ID so it is preserved
    return data;
  }


}
