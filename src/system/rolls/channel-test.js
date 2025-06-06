import TestWFRP from "./test-wfrp4e.js"

export default class ChannelTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.data.preData.malignantInfluence = data.malignantInfluence;
    this.data.preData.unofficialGrimoire = game.settings.get("wfrp4e", "homebrew").unofficialgrimoire;
    this.data.preData.ingredientMode = data.ingredientMode ?? "none";
    this.data.preData.skill = data.skill?.id;
    this.data.context.channelUntilSuccess = data.channelUntilSuccess

    this.computeTargetNumber();
  }

  static fromData(...args)
  {
    return new this(...args);
  }

  computeTargetNumber() {
    let skill = this.actor.items.get(this.preData.skill);
    if (!skill)
      this.result.target = this.actor.system.characteristics[this.characteristicKey].value
    else
      this.result.target = skill.total.value

    super.computeTargetNumber();
  }

  async runPreEffects() {
    await super.runPreEffects();
    await Promise.all(this.actor.runScripts("preChannellingTest", { test: this, chatOptions: this.context.chatOptions }))
    await Promise.all(this.item.runScripts("preChannellingTest", { test: this, chatOptions: this.context.chatOptions }))

  }

  async runPostEffects() {
    await super.runPostEffects();
    await Promise.all(this.actor.runScripts("rollChannellingTest", { test: this, chatOptions: this.context.chatOptions }))
    await Promise.all(this.item.runScripts("rollChannellingTest", { test: this, chatOptions: this.context.chatOptions }))
    Hooks.call("wfrp4e:rollChannelTest", this, this.context.chatOptions)
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
    if (this.failed) 
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
          if (this.result.roll == 100 && game.settings.get("wfrp4e", "homebrew").mooCatastrophicMiscasts) {
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
    this.result.tooltips.miscast = "<ul style='text-align: left'>" + this.result.tooltips.miscast.map(t => `<li>${t}</li>`).join("") + "</ul>";
  }

  computeTables()
  {
    super.computeTables();
    if (this.result.criticalchannell)
    {
      // Not really a table?
      this.result.tables.criticalchannell = {
        label : this.result.criticalchannell,
        class : "critical-roll",
      }
    }
    if (this.result.minormis)
    {
      this.result.tables.miscast = {
        label : this.result.minormis,
        class : "fumble-roll",
        key : "minormis"
      }
    }
    if (this.result.nullminormis)
    {
      this.result.tables.nullminormis = {
        label : this.result.nullminormis,
        class : "fumble-roll",
        key : "minormis",
        nulled : true
      }
    }
    if (this.result.majormis)
    {
      this.result.tables.miscast = {
        label : this.result.majormis,
        class : "fumble-roll",
        key : "majormis",
      }
    }
    if (this.result.nullmajormis)
    {
      this.result.tables.nullmajormis = {
        label : this.result.nullmajormis,
        class : "fumble-roll",
        key : "majormis",
        nulled : true
      }
    }
    if (this.result.catastrophicmis)
    {
      this.result.tables.miscast = {
        label : this.result.catastrophicmis,
        class : "fumble-roll",
        key : "catastrophicmis",
      }
    }
    if (this.result.nullcatastrophicmis)
    {
      this.result.tables.nullcatastrophicmis = {
        label : this.result.nullcatastrophicmis,
        class : "fumble-roll",
        key : "nullcatastrophicmis",
        nulled : true
      }
    }
    if (this.result.grimoiremiscast)
    {
      this.result.tables.grimoiremiscast = {
        label : this.result.grimoiremiscast,
        class : "fumble-roll",
        key : "grimoire-miscast",
      }
    }
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
      (this.failed && game.settings.get("wfrp4e", "useWoMInfluences"))) 
    {
      this.result.tooltips.miscast.push(game.i18n.localize("CHAT.MalignantInfluence"))
      return 1;
    }
  }

  async postTest() {
    //@/HOUSE

    
      if (this.preData.unofficialGrimoire) {
        game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
        if (this.preData.ingredientMode != 'none' && this.hasIngredient && this.item.ingredient?.quantity.value > 0 && !this.context.edited && !this.context.reroll) {
          await this.item.ingredient.update({ "system.quantity.value": this.item.ingredient.quantity.value - 1 })
          this.result.ingredientConsumed = true;
          ChatMessage.create({ speaker: this.data.context.speaker, content: game.i18n.localize("ConsumedIngredient") })
        }
        //@/HOUSE
      } 
      else if (game.settings.get("wfrp4e", "homebrew").channellingIngredients)
      {
        // Find ingredient being used, if any
        if (this.hasIngredient && this.item.ingredient?.quantity.value > 0 && !this.context.edited && !this.context.reroll)
          await this.item.ingredient.update({ "system.quantity.value": this.item.ingredient.quantity.value - 1 })
      }

    let SL = Number(this.result.SL);

    if (this.succeeded)
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
    if(this.preData.unofficialGrimoire && this.preData.ingredientMode == 'power' && this.result.ingredientConsumed && this.succeeded) {
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
    if (Number(SL) < 0 && game.settings.get("wfrp4e", "homebrew").channelingNegativeSLTests)
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
    if (!game.settings.get("wfrp4e", "homebrew").channellingIngredients && this.item.lore.value != "witchcraft")
    {
      return false 
    }
    else 
    {
      return this.item.ingredient && this.item.ingredient.quantity.value > 0
    }
  }


  // Channelling should not show any effects to apply 
  get damageEffects() 
  {
      return [];
  }

  get targetEffects() 
  {
      return [];
  }

  get areaEffects() 
  {
      return [];
  }

  get spell() {
    return this.item
  }

  updateChannelledItems(slDelta) 
  {
    let item = this.item.toObject();
    item.system.cn.SL += slDelta
    let computedCN = item.system.memorized.value ? item.system.cn.value : item.system.cn.value * 2

    // THIS WHOLE PROCESS CAN GO TO HELL
    // Cap SL to CN if WoM channelling is disabled
    if (!game.settings.get("wfrp4e", "useWoMChannelling")) {
      this.result.pastSL = item.system.cn.SL - computedCN; // Needed to accurately account for edits and change in SL
      item.system.cn.SL = Math.min(computedCN, item.system.cn.SL);
    }
    if (item.system.cn.SL < 0) {
      this.result.pastSL = item.system.cn.SL
    }
    item.system.cn.SL = Math.max(0, item.system.cn.SL)

    this.actor.updateEmbeddedDocuments("Item", [item])
    return item.system.cn.SL
  }

}
