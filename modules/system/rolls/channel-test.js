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

  async runPreEffects() {
    await super.runPreEffects();
    await this.actor.runEffects("preChannellingTest", { test: this, cardOptions: this.context.cardOptions })
  }

  async runPostEffects() {
    await super.runPostEffects();
    await this.actor.runEffects("rollChannellingTest", { test: this, cardOptions: this.context.cardOptions }, {item : this.item})
    Hooks.call("wfrp4e:rollChannelTest", this, this.context.cardOptions)
  }

  async computeResult() {
    await super.computeResult();
    let miscastCounter = 0;
    let SL = this.result.SL;
    this.result.tooltips.miscast = []

    // Witchcraft automatically miscast
    if (this.item.lore.value == "witchcraft") {
      miscastCounter++;
      this.result.other.push(game.i18n.localize("CHAT.WitchcraftMiscast"))
      this.result.tooltips.miscast.push(game.i18n.localize("CHAT.AutoWitchcraftMiscast"))
    }

    // Test itself was failed
    if (this.result.outcome == "failure") 
    {
      this.result.description = game.i18n.localize("ROLL.ChannelFailed")
      // Major Miscast on fumble
      if (this.result.roll % 11 == 0 ||
         (this.result.roll % 10 == 0 && !game.settings.get("wfrp4e", "useWoMChannelling")) || // If WoM channelling, 10s don't cause miscasts
          this.result.roll == 100)
      {

        this.result.color_red = true;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.FumbleMiscast"))
        //@HOUSE
        if (this.preData.unofficialGrimoire) 
        {
          game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
          miscastCounter += 1;
          if(this.result.roll == 100 || this.result.roll == 99) 
          {
            SL = this.item.cn.value * (-1)
            miscastCounter += 1;
          }
        //@HOUSE
        } 
        else 
        {
          if (game.settings.get("wfrp4e", "useWoMChannelling")) // Fumble is only minor when using WoM Channelling
          {
            miscastCounter += 1
          }
          else 
          {
            miscastCounter += 2;
          }

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

    miscastCounter += this._checkInfluences() || 0
    this._handleMiscasts(miscastCounter)
    this.result.tooltips.miscast = this.result.tooltips.miscast.join("\n")
  }

  _checkInfluences()
  {
    if (!this.preData.malignantInfluence) 
    {
      return 0
    }

    // If malignant influence AND roll has an 8 in the ones digit, miscast
    if (
      (Number(this.result.roll.toString().split('').pop()) == 8 && !game.settings.get("wfrp4e", "useWoMInfluences")) || 
      (this.result.outcome == "failure" && game.settings.get("wfrp4e", "useWoMInfluences"))) 
    {
      this.result.tooltips.miscast.push(game.i18n.localize("CHAT.MalignantInfluence"))
      return 1;
    }
  }

  async postTest() {
    //@/HOUSE

    
      if (this.preData.unofficialGrimoire) {
        game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
        if (this.preData.unofficialGrimoire.ingredientMode != 'none' && this.hasIngredient && this.item.ingredient.quantity.value > 0 && !this.context.edited && !this.context.reroll) {
          await this.item.ingredient.update({ "system.quantity.value": this.item.ingredient.quantity.value - 1 })
          this.result.ingredientConsumed = true;
          ChatMessage.create({ speaker: this.data.context.speaker, content: game.i18n.localize("ConsumedIngredient") })
        }
        //@/HOUSE
      } 
      else if (game.settings.get("wfrp4e", "channellingIngredients"))
      {
        // Find ingredient being used, if any
        if (this.hasIngredient && this.item.ingredient.quantity.value > 0 && !this.context.edited && !this.context.reroll)
          await this.item.ingredient.update({ "system.quantity.value": this.item.ingredient.quantity.value - 1 })
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

    // // If channelling test was edited, make sure to adjust the SL accordingly
    // if (this.context.previousResult?.previousChannellingSL > 0)
    // {
    //   channellDelta = SL - parseInt(this.context.previousResult.SL)
    // }

    

    //@HOUSE
    if(this.preData.unofficialGrimoire && (this.item.cn.SL + SL) > this.item.cn.value) {
      game.wfrp4e.utility.logHomebrew("unofficialgrimoire-overchannelling");
      this.result.overchannelling = this.item.cn.SL + SL - this.item.cn.value;
    }
    //@HOUSE

    this.result.channelledSL = SL

    if (game.settings.get("wfrp4e", "useWoMChannelling"))
    {
      if (this.result.criticalchannell)
      {
        this.result.channelledSL += this.actor.system.characteristics.wp.bonus;
      }
    }
    else 
    {

      if (this.result.criticalchannell)
      {
        this.result.channelledSL = this.item.cn.value
      }
    }

    let SLdelta = this.result.channelledSL - (this.context.previousResult?.channelledSL || 0) + (this.context.previousResult?.pastSL || 0)

    if(SL > 0) {
      this.result.SL = "+" + SL;
    } else {
      this.result.SL = SL.toString()
    }

    let newSL = this.updateChannelledItems(SLdelta)   
    this.result.channelledDisplay = newSL.toString();
    if (!game.settings.get("wfrp4e", "useWoMChannelling"))
    {
      this.result.channelledDisplay += " / " + this.item.cn.value.toString()
    }

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

    // If channelling with ingredients isn't allowed, always return false 
    // HOWEVER: Witchcraft specifies: "channeling or casting spells from this Lore automatically require a roll on the Minor Miscast table unless cast with an ingredient"
    // This doesn't make any sense. So what I'm doing is if it's a witchcraft spell, and has a valid ingredient assigned, still count it, as it will have to be assumed it's used in the eventual cast?
    if (!game.settings.get("wfrp4e", "channellingIngredients") && this.item.lore.value != "witchcraft")
    {
      return false 
    }
    else 
    {
      return this.item.ingredient && this.item.ingredient.quantity.value > 0
    }
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
  updateChannelledItems(slDelta)
  {
    let items = [this.item];
    if (game.settings.get("wfrp4e", "useWoMChannelling"))
    {
      items = this.actor.items.filter(s => s.type == "spell" && s.system.lore.value == this.spell.system.lore.value)
    }

    items = items.map(i => i.toObject());
    items.forEach(i => {
      i.system.cn.SL += slDelta

      // THIS WHOLE PROCESS CAN GO TO HELL
      // Cap SL to CN if WoM channelling is disabled
      if (!game.settings.get("wfrp4e", "useWoMChannelling"))
      {
        this.result.pastSL = i.system.cn.SL - i.system.cn.value; // Needed to accurately account for edits and change in SL
        i.system.cn.SL = Math.min(i.system.cn.value, i.system.cn.SL);
      }
      if (i.system.cn.SL < 0)
      {
        this.result.pastSL = i.system.cn.SL
      }
      i.system.cn.SL = Math.max(0, i.system.cn.SL) 
    });

    this.actor.updateEmbeddedDocuments("Item", items)
    return items[0].system.cn.SL
  }

}
