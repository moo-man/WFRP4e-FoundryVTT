import TestWFRP from "./test-wfrp4e.js"

export default class ChannelTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.preData.unofficialGrimoire = data.unofficialGrimoire;
    this.preData.skillSelected = data.skillSelected;
    this.data.preData.malignantInfluence = data.malignantInfluence

    this.data.context.channelUntilSuccess = data.channelUntilSuccess

    this.computeTargetNumber();
    this.preData.skillSelected = data.skillSelected instanceof Item ? data.skillSelected.name : data.skillSelected;
  }

  computeTargetNumber() {
    // Determine final target if a characteristic was selected
    try {
      if (this.preData.skillSelected.char)
        this.result.target = this.actor.characteristics[this.preData.skillSelected.key].value

      else {
        let skill = this.actor.getItemTypes("skill").find(s => s.name == this.preData.skillSelected.name)
        if (!skill && typeof this.preData.skillSelected == "string")
          skill = this.actor.getItemTypes("skill").find(s => s.name == this.preData.skillSelected)
        if (skill)
          this.result.target = skill.total.value
      }

    }
    catch
    {
      let skill = this.actor.getItemTypes("skill").find(s => s.name == `${game.i18n.localize("NAME.Channelling")} (${game.wfrp4e.config.magicWind[this.item.lore.value]})`)
      if (!skill)
        this.result.target = this.actor.characteristics.wp.value
      else
        this.result.target = skill.total.value

    }
    super.computeTargetNumber();
      
  }

  runPreEffects() {
    super.runPreEffects();
    this.actor.runEffects("preChannellingTest", { test: this, cardOptions: this.context.cardOptions })
  }

  runPostEffects() {
    super.runPostEffects();
    this.actor.runEffects("rollChannellingTest", { test: this, cardOptions: this.context.cardOptions }, {item : this.item})
    Hooks.call("wfrp4e:rollChannelTest", this, this.context.cardOptions)
  }

  async computeResult() {
    await super.computeResult();
    let miscastCounter = 0;
    let SL = this.result.SL;
    this.result.tooltips.miscast = []

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

    // Test itself was failed
    if (this.result.outcome == "failure") {

      this.result.description = game.i18n.localize("ROLL.ChannelFailed")
      // Major Miscast on fumble
      if (this.result.roll % 11 == 0 || this.result.roll % 10 == 0 || this.result.roll == 100) {
        this.result.color_red = true;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.FumbleMiscast"))
        //@HOUSE
        if (this.preData.unofficialGrimoire) {
          game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
          miscastCounter += 1;
          if(this.result.roll == 100 || this.result.roll == 99) {
            SL = this.item.cn.value * (-1)
            miscastCounter += 1;
          }
        //@HOUSE
        } else {
          miscastCounter += 2;

          //@HOUSE
          if (this.result.roll == 100 && game.settings.get("wfrp4e", "mooCatastrophicMiscasts")) {
            game.wfrp4e.utility.logHomebrew("mooCatastrophicMiscasts")
            miscastCounter++
          }
          //@/HOUSE
        }
      }
    }
    else // Successs - add SL to spell for further use
    {
      this.result.description = game.i18n.localize("ROLL.ChannelSuccess")

      // Critical Channel - miscast and set SL gained to CN
      if (this.result.roll % 11 == 0) {
        this.result.color_green = true;
        this.result.criticalchannell = game.i18n.localize("ROLL.CritChannel")
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.CritChannelMiscast"))
        miscastCounter++;
        this.spell.flags.criticalchannell = true; // Locally apply the critical channell flag
      }
    }

    this._handleMiscasts(miscastCounter)
    this.result.tooltips.miscast = this.result.tooltips.miscast.join("\n")
  }

  postTest() {
    //@/HOUSE
    if (this.preData.unofficialGrimoire) {
      game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
      if (this.preData.unofficialGrimoire.ingredientMode != 'none' && this.hasIngredient && this.item.ingredient.quantity.value > 0 && !this.context.edited && !this.context.reroll) {
        this.item.ingredient.update({ "system.quantity.value": this.item.ingredient.quantity.value - 1 })
        this.result.ingredientConsumed = true;
        ChatMessage.create({ speaker: this.data.context.speaker, content: game.i18n.localize("ConsumedIngredient") })
      }
    //@/HOUSE
    } else {
      // Find ingredient being used, if any
      if (this.hasIngredient && this.item.ingredient.quantity.value > 0 && !this.context.edited && !this.context.reroll)
        this.item.ingredient.update({ "system.quantity.value": this.item.ingredient.quantity.value - 1 })
    }

    let SL = Number(this.result.SL);

    if (this.result.outcome == "success")
    {
        // Optional Rule: If SL in extended test is -/+0, counts as -/+1
      if (Number(SL) == 0 && game.settings.get("wfrp4e", "extendedTests"))
          SL = 1;
    }
    else // If outcome == failure 
    {
      // Optional Rule: If SL in extended test is -/+0, counts as -/+1
      if (Number(SL) == 0 && game.settings.get("wfrp4e", "extendedTests"))
        SL = -1;
    }

    //@HOUSE
    if(this.preData.unofficialGrimoire && this.preData.unofficialGrimoire.ingredientMode == 'power' && this.result.ingredientConsumed && this.result.outcome == "success") {
      game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
      SL = Number(SL) * 2
    }
    //@HOUSE

    // Optional Rule: If SL in a channel attempt SL is negative, set SL to 0
    // This is tested after the previous rule so:
    // SL == 0 triggers previous rule and sets SL to -1, SL == -1 triggers this rule and sets SL 0
    // SL < 0 doesn't trigger previous rule, SL < 0 triggers this rule and sets SL 0 
    // In both cases SL resolves to 0 as expected by this rule.
    // "SL < 0" is used over "SL <= 0" since if previous rule isn't True SL 0 resolves no channel progress
    if (Number(SL) < 0 && game.settings.get("wfrp4e", "channelingNegativeSLTests"))
      SL = 0;

    if (this.context.previousResult?.SL > 0)
      SL -= this.context.previousResult.SL


    //@HOUSE
    if(this.preData.unofficialGrimoire && (this.item.cn.SL + SL) > this.item.cn.value) {
      game.wfrp4e.utility.logHomebrew("unofficialgrimoire-overchannelling");
      this.result.overchannelling = this.item.cn.SL + SL - this.item.cn.value;
    }
    //@HOUSE
  
    if(SL > 0) {
      this.result.SL = "+" + SL;
    } else {
      this.result.SL = SL.toString()
    }

    let newSL

    if (game.settings.get("wfrp4e", "useWoMChannelling"))
    {
      newSL = Math.max(Number(this.item.cn.SL) + SL, 0)
      if (this.result.criticalchannell)
      {
        newSL += this.actor.system.characteristics.wp.bonus;
      }
      this.result.channelledSL = newSL.toString();
    }
    else 
    {
      newSL = Math.clamped(Number(this.item.cn.SL) + SL, 0, this.item.cn.value)
      if (this.result.criticalchannell)
      {
        newSL = this.item.cn.value
      }
      this.result.CN = newSL.toString() + " / " + this.item.cn.value.toString()
    }
    this.updateChannelledItems({"system.cn.SL" : newSL})


   

    if (this.result.miscastModifier) {
      if (this.result.minormis)
        this.result.minormis += ` (${this.result.miscastModifier})`
      if (this.result.majormis)
        this.result.majormis += ` (${this.result.miscastModifier})`
      if (this.result.catastrophicmis)
        this.result.catastrophicmis += ` (${this.result.miscastModifier})`
    }
  }

  get hasIngredient() {
    return this.item.ingredient && this.item.ingredient.quantity.value > 0
  }

  get spell() {
    return this.item
  }

  // Channelling shouldn't show effects
  get effects() {
    return []
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

  // WoM channelling updates all items of the lore channelled
  updateChannelledItems(update)
  {
    let items = [this.item]
    if (game.settings.get("wfrp4e", "useWoMChannelling"))
    {
      items = this.actor.items.filter(s => s.type == "spell" && s.system.lore.value == this.spell.system.lore.value).map(i => i.toObject())
    }

    items.forEach(i => mergeObject(i, update));
    return this.actor.updateEmbeddedDocuments("Item", items)
  }

}
