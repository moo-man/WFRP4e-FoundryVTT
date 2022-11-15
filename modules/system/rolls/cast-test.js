import TestWFRP from "./test-wfrp4e.js"

export default class CastTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.preData.itemData = data.itemData || this.item.toObject() // Store item data to avoid rerolls being affected by changed channeled SL
    this.preData.skillSelected = data.skillSelected;
    this.preData.unofficialGrimoire = data.unofficialGrimoire;
    this.data.preData.malignantInfluence = data.malignantInfluence

    this.computeTargetNumber();
    this.preData.skillSelected = data.skillSelected instanceof Item ? data.skillSelected.name : data.skillSelected;
  }

  computeTargetNumber() {
    try {

      // Determine final target if a characteristic was selected
      if (this.preData.skillSelected.char)
        this.result.target = this.actor.characteristics[this.preData.skillSelected.key].value

      else if (this.preData.skillSelected.name == this.item.skillToUse.name)
        this.result.target = this.item.skillToUse.total.value

      else if (typeof this.preData.skillSelected == "string") {
        let skill = this.actor.getItemTypes("skill").find(s => s.name == this.preData.skillSelected)
        if (skill)
          this.result.target = skill.total.value
      }
      else
        this.result.target = this.item.skillToUse.total.value

    }
    catch {
      this.result.target = this.item.skillToUse.total.value
    }

    super.computeTargetNumber();
  }

  runPreEffects() {
    super.runPreEffects();
    this.actor.runEffects("preRollCastTest", { test: this, cardOptions: this.context.cardOptions })
    //@HOUSE
    if (this.preData.unofficialGrimoire && this.preData.unofficialGrimoire.ingredientMode == 'power' && this.hasIngredient) { 
      game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
      this.preData.canReverse = true;
    }
    //@HOUSE
  }

  runPostEffects() {
    super.runPostEffects();
    this.actor.runEffects("rollCastTest", { test: this, cardOptions: this.context.cardOptions }, {item : this.item})
    Hooks.call("wfrp4e:rollCastTest", this, this.context.cardOptions)
  }

  async computeResult() {
    await super.computeResult();

    let miscastCounter = 0;
    let CNtoUse = this.item.cn.value
    this.result.overcast = duplicate(this.item.overcast)
    this.result.tooltips.miscast = []
    
    //@HOUSE
    if (this.preData.unofficialGrimoire && this.preData.other.indexOf(game.i18n.localize("ROLL.Reverse")) != -1) {
      if (this.data.result.roll.toString()[this.data.result.roll.toString().length -1] == '8') {
        game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
        miscastCounter++;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.PowerIngredientMiscast"));
      }
    }
    //@HOUSE

    // Partial channelling - reduce CN by SL so far
    if (game.settings.get("wfrp4e", "partialChannelling")) {
      CNtoUse -= this.preData.itemData.system.cn.SL;
    }
    // Normal Channelling - if SL has reached CN, CN is considered 0
    else if (this.preData.itemData.system.cn.SL >= this.item.cn.value) {
      CNtoUse = 0;
    }

    // If malignant influence AND roll has an 8 in the ones digit, miscast
    if (this.preData.malignantInfluence)
      if (Number(this.result.roll.toString().split('').pop()) == 8) {
        miscastCounter++;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.MalignantInfluence"))
      }

    // Witchcraft automatically miscast
    if (this.item.lore.value == "witchcraft") {
      miscastCounter++;
      this.result.other.push(game.i18n.localize("CHAT.WitchcraftMiscast"))
      this.result.tooltips.miscast.push(game.i18n.localize("CHAT.AutoWitchcraftMiscast"))
    }

    // slOver is the amount of SL over the CN achieved
    let slOver = (Number(this.result.SL) - CNtoUse)

    // Test itself was failed
    if (this.result.outcome == "failure") {
      this.result.castOutcome = "failure"
      this.result.description = game.i18n.localize("ROLL.CastingFailed")
      if (this.preData.itemData.system.cn.SL) {
        miscastCounter++
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.ChannellingMiscast"))
      }
      // Miscast on fumble
      if (this.result.roll % 11 == 0 || this.result.roll == 100) {
        this.result.color_red = true;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.FumbleMiscast"))
        miscastCounter++;
        //@HOUSE
        if (this.result.roll == 100 && game.settings.get("wfrp4e", "mooCatastrophicMiscasts")) {
          game.wfrp4e.utility.logHomebrew("mooCatastrophicMiscasts")
          miscastCounter++
        }
        //@/HOUSE
      }
      //@/HOUSE
      if (this.preData.unofficialGrimoire && this.preData.unofficialGrimoire.overchannelling > 0) { 
        game.wfrp4e.utility.logHomebrew("overchannelling");
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.OverchannellingMiscast"))
        miscastCounter++;
      }
      //@/HOUSE
    }
    else if (slOver < 0) // Successful test, but unable to cast due to not enough SL
    {
      this.result.castOutcome = "failure"
      this.result.description = game.i18n.localize("ROLL.CastingFailed")
      //@/HOUSE
      if (this.preData.unofficialGrimoire && this.preData.unofficialGrimoire.overchannelling > 0) { 
        game.wfrp4e.utility.logHomebrew("overchannelling");
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.OverchannellingMiscast"))
        miscastCounter++;
      }
      //@/HOUSE
      // Critical Casting - succeeds only if the user chooses Total Power option (which is assumed)
      if (this.result.roll % 11 == 0) {
        this.result.color_green = true;
        this.result.castOutcome = "success"
        this.result.description = game.i18n.localize("ROLL.CastingSuccess")
        this.result.critical = game.i18n.localize("ROLL.TotalPower")
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.TotalPowerMiscast"))
        miscastCounter++;
      }
    }

    else // Successful test, casted - determine overcast
    {
      this.result.castOutcome = "success"
      this.result.description = game.i18n.localize("ROLL.CastingSuccess");
      //@/HOUSE
      if (this.preData.unofficialGrimoire && this.preData.unofficialGrimoire.overchannelling > 0) {
        game.wfrp4e.utility.logHomebrew("overchannelling");
        slOver += this.preData.unofficialGrimoire.overchannelling;
      }
      //@/HOUSE

      if (this.result.roll % 11 == 0) {
        this.result.critical = game.i18n.localize("ROLL.CritCast")
        this.result.color_green = true;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.CritCastMiscast"))
        miscastCounter++;
      }

      //@HOUSE
      if (game.settings.get("wfrp4e", "mooCriticalChannelling")) {
        game.wfrp4e.utility.logHomebrew("mooCriticalChannelling")
        if (this.spell.flags.criticalchannell && CNtoUse == 0) {
          this.result.SL = "+" + Number(this.result.SL) + this.item._source.system.cn.value
          this.result.other.push(game.i18n.localize("MOO.CriticalChanelling"))
        }
      }
      //@/HOUSE
    }
    //@HOUSE
    if (this.preData.unofficialGrimoire && this.preData.unofficialGrimoire.quickcasting && miscastCounter > 0) { 
      game.wfrp4e.utility.logHomebrew("quickcasting");
      this.result.other.push(game.i18n.localize("CHAT.Quickcasting"))
      miscastCounter++;
    }
    //@/HOUSE
    
    this._calculateOverCast(slOver);

    this._handleMiscasts(miscastCounter)
    await this._calculateDamage()

    // TODO handle all tooltips (when they are added) in one place
    // TODO Fix weird formatting in tooltips (indenting)
    this.result.tooltips.miscast = this.result.tooltips.miscast.join("\n")

    return this.result;
  }

  _calculateOverCast(slOver) {
    this.result.overcasts = Math.max(0, Math.floor(slOver / 2));
    this.result.overcast.total = this.result.overcasts;
    this.result.overcast.available = this.result.overcasts;
  }

  async _calculateDamage() {
    this.result.additionalDamage = this.preData.additionalDamage || 0
    // Calculate Damage if the this.item has it specified and succeeded in casting
    try {
      if (this.item.Damage && this.result.castOutcome == "success")
        this.result.damage = Number(this.result.SL) + Number(this.item.Damage)

      if (this.item.damage.dice && !this.result.additionalDamage) {
        let roll = await new Roll(this.item.damage.dice).roll()
        this.result.diceDamage = { value: roll.total, formula: roll.formula };
        this.preData.diceDamage = this.result.diceDamage
        this.result.additionalDamage += roll.total;
        this.preData.additionalDamage = this.result.additionalDamage;
      }
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("ErrorDamageCalc") + ": " + error)
    } // If something went wrong calculating damage, do nothing and continue

  }


  postTest() {
    //@/HOUSE
    if (this.preData.unofficialGrimoire) {
      game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
      if (this.preData.unofficialGrimoire.ingredientMode != 'none' && this.hasIngredient && this.item.ingredient.quantity.value > 0 && !this.context.edited && !this.context.reroll) {
        this.item.ingredient.update({ "system.quantity.value": this.item.ingredient.quantity.value - 1 })
        ChatMessage.create({ speaker: this.context.speaker, content: game.i18n.localize("ConsumedIngredient") })
      }
    //@/HOUSE
    } else {
      // Find ingredient being used, if any
      if (this.hasIngredient && this.item.ingredient.quantity.value > 0 && !this.context.edited && !this.context.reroll)
        this.item.ingredient.update({ "system.quantity.value": this.item.ingredient.quantity.value - 1 })
    }

    // Set initial extra overcasting options to SL if checked
    if (this.result.overcast.enabled) {
      if (this.item.overcast.initial.type == "SL") {
        setProperty(this.result, "overcast.usage.other.initial", parseInt(this.result.SL) + (parseInt(this.item.computeSpellPrayerFormula("", false, this.spell.overcast.initial.additional)) || 0))
        setProperty(this.result, "overcast.usage.other.current", parseInt(this.result.SL) + (parseInt(this.item.computeSpellPrayerFormula("", false, this.spell.overcast.initial.additional)) || 0))
      }
    }

    if (this.result.miscastModifier) {
      if (this.result.minormis)
        this.result.minormis += ` (${this.result.miscastModifier})`
      if (this.result.majormis)
        this.result.majormis += ` (${this.result.miscastModifier})`
      if (this.result.catastrophicmis)
        this.result.catastrophicmis += ` (${this.result.miscastModifier})`
    }

    //@HOUSE
    if (this.item.cn.SL > 0) {

      if (this.result.castOutcome == "success" || !game.settings.get("wfrp4e", "mooCastAfterChannelling"))
        this.item.update({ "system.cn.SL": 0 })

      else if (game.settings.get("wfrp4e", "mooCastAfterChannelling")) {
        game.wfrp4e.utility.logHomebrew("mooCastAfterChannelling")
        if (this.item.cn.SL > 0 && this.result.castOutcome == "failure")
          this.result.other.push(game.i18n.localize("MOO.FailedCast"))
      }
    }
    //@/HOUSE
  }

  get hasIngredient() {
    return this.item.ingredient && this.item.ingredient.quantity.value > 0
  }

  get spell() {
    return this.item
  }

  get characteristicKey() {
    if (this.preData.skillSelected.char)
      return this.preData.skillSelected.key

    else {
      let skill = this.actor.getItemTypes("skill").find(s => s.name == this.preData.skillSelected)
      if (skill)
        return skill.characteristic.key
    }
  }
}
