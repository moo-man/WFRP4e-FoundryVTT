import TestWFRP from "./test-wfrp4e.js"

export default class ChannelTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.preData.skillSelected = data.skillSelected;
    this.data.preData.malignantInfluence = data.malignantInfluence

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
    this.actor.runEffects("rollChannellingTest", { test: this, cardOptions: this.context.cardOptions })
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
      // Optional Rule: If SL in extended test is -/+0, counts as -/+1
      if (Number(SL) == 0 && game.settings.get("wfrp4e", "extendedTests"))
        SL = -1;

      // Optional Rule: If SL in a channel attempt SL is negative, set SL to 0
      // This is tested after the previous rule so:
      // SL == 0 triggers previous rule and sets SL to -1, SL == -1 triggers this rule and sets SL 0
      // SL < 0 doesn't trigger previous rule, SL < 0 triggers this rule and sets SL 0 
      // In both cases SL resolves to 0 as expected by this rule.
      // "SL < 0" is used over "SL <= 0" since if previous rule isn't True SL 0 resolves no channel progress
      if (Number(SL) < 0 && game.settings.get("wfrp4e", "channelingNegativeSLTests"))
        SL = 0;

      this.result.description = game.i18n.localize("ROLL.ChannelFailed")
      // Major Miscast on fumble
      if (this.result.roll % 11 == 0 || this.result.roll % 10 == 0 || this.result.roll == 100) {
        this.result.color_red = true;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.FumbleMiscast"))
        miscastCounter += 2;

        //@HOUSE
        if (this.result.roll == 100 && game.settings.get("wfrp4e", "mooCatastrophicMiscasts")) {
          game.wfrp4e.utility.logHomebrew("mooCatastrophicMiscasts")
          miscastCounter++
        }
        //@/HOUSE
      }
    }
    else // Successs - add SL to spell for further use
    {
      this.result.description = game.i18n.localize("ROLL.ChannelSuccess")

      // Optional Rule: If SL in extended test is -/+0, counts as -/+1
      if (Number(SL) == 0 && game.settings.get("wfrp4e", "extendedTests"))
        SL = 1;

      // Critical Channel - miscast and set SL gained to CN
      if (this.result.roll % 11 == 0) {
        this.result.color_green = true;
        SL = this.item.cn.value;
        this.result.criticalchannell = game.i18n.localize("ROLL.CritChannel")
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.CritChannelMiscast"))
        miscastCounter++;
        this.spell.data.flags.criticalchannell = true; // Locally apply the critical channell flag
      }
    }

    // Add SL to CN and update actor
    SL = this.item.cn.SL + Number(SL);
    if (SL > this.item.cn.value)
      SL = this.item.cn.value;
    else if (SL < 0)
      SL = 0;

    this._handleMiscasts(miscastCounter)
    this.result.tooltips.miscast = this.result.tooltips.miscast.join("\n")
  }

  postTest() {
    // Find ingredient being used, if any
    if (this.hasIngredient && this.item.ingredient.quantity.value > 0 && !this.context.edited && !this.context.reroll)
      this.item.ingredient.update({ "data.quantity.value": this.item.ingredient.quantity.value - 1 })

    
    let SL = Number(this.result.SL);
    if (this.context.previousResult?.SL > 0)
      SL -= this.context.previousResult.SL

    let newSL = Math.clamped(Number(this.item.cn.SL) + SL, 0, this.item.cn.value)
    
    this.item.update({ "data.cn.SL": newSL })

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
}
