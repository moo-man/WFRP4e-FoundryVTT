import TestWFRP from "./test-wfrp4e.js"

export default class ChannelTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.preData.skillSelected = data.skillSelected;
    this.data.preData.malignantInfluence = data.malignantInfluence

    this.computeTargetNumber();
    this.preData.skillSelected = data.skillSelected instanceof Item ? data.skillSelected.name : data.skillSelected ;
  }

  computeTargetNumber() {
    // Determine final target if a characteristic was selected
    if (this.preData.skillSelected.char)
      this.preData.target = this.actor.characteristics[this.preData.skillSelected.key].value

    else {
      let skill = this.actor.getItemTypes("skill").find(s => s.name == this.preData.skillSelected.name)
      if (skill)
        this.preData.target = skill.total.value
    }
    super.computeTargetNumber();
  }

  async roll() {
    await super.roll()
    this._rollChannelTest();
  }

  _rollChannelTest() {
    let miscastCounter = 0;
    let SL = this.result.SL;

    // If malignant influence AND roll has an 8 in the ones digit, miscast
    if (this.preData.malignantInfluence)
      if (Number(this.result.roll.toString().split('').pop()) == 8)
        miscastCounter++;

    // Witchcraft automatically miscast
    if (this.item.lore.value == "witchcraft")
      miscastCounter++;

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
        miscastCounter += 2;
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
        if (!this.preData.AA)
          miscastCounter++;
      }
    }

    // Add SL to CN and update actor
    SL = this.item.cn.SL + Number(SL);
    if (SL > this.item.cn.value)
      SL = this.item.cn.value;
    else if (SL < 0)
      SL = 0;

    this._handleMiscasts(miscastCounter)
  }

  _handleMiscasts(miscastCounter) {
    if (this.hasIngredient)
      miscastCounter--;
    if (miscastCounter < 0)
      miscastCounter = 0;
    if (miscastCounter > 2)
      miscastCounter = 2

    if (miscastCounter == 1) {
      if (this.hasIngredient)
        this.result.nullminormis = game.i18n.localize("ROLL.MinorMis")
      else {
        this.result.minormis = game.i18n.localize("ROLL.MinorMis")
      }
    }
    else if (miscastCounter == 2) {
      if (this.hasIngredient) {
        this.result.nullmajormis = game.i18n.localize("ROLL.MajorMis")
        this.result.minormis = game.i18n.localize("ROLL.MinorMis")
      }
      else {
        this.result.majormis = game.i18n.localize("ROLL.MajorMis")
      }
    }
    else if (miscastCounter >= 3) {
      this.result.majormis = game.i18n.localize("ROLL.MajorMis")
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

  get characteristicKey()
  {
    if (this.preData.skillSelected.char)
      return this.preData.skillSelected.key

    else {
      let skill = this.actor.getItemTypes("skill").find(s => s.name == this.preData.skillSelected)
      if (skill)
        return skill.characteristic.key
    }
  }
}
