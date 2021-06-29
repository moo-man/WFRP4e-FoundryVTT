import TestWFRP from "./test-wfrp4e.js"

export default class CastTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.data.result.overcast = this.item.overcast
    this.preData.skillSelected = data.skillSelected;
    this.data.preData.malignantInfluence = data.malignantInfluence

    this.computeTargetNumber();
    this.preData.skillSelected = data.skillSelected.name;
  }

  computeTargetNumber() {
    // Determine final target if a characteristic was selected
    if (this.preData.skillSelected.char)
      this.preData.target = this.actor.characteristics[this.preData.skillSelected.key].value

    else if (this.preData.skillSelected.name == this.item.skillToUse.name)
      this.preData.target = this.item.skillToUse.total.value

    else if (typeof this.preData.skillSelected == "string") {
      let skill = this.actor.getItemTypes("skill").find(s => s.name == this.preData.skillSelected)
      if (skill)
        this.preData.target = skill.total.value
    }
    super.computeTargetNumber();
  }

  async roll() {
    await super.roll()
    this._rollCastTest();
  }

  _rollCastTest() {
    let miscastCounter = 0;
    let CNtoUse = this.item.cn.value
    // Partial channelling - reduce CN by SL so far
    if (game.settings.get("wfrp4e", "partialChannelling")) {
      CNtoUse -= this.item.cn.SL;
    }
    // Normal Channelling - if SL has reached CN, CN is considered 0
    else if (this.item.cn.SL >= this.item.cn.value) {
      CNtoUse = 0;
    }

    // If malignant influence AND roll has an 8 in the ones digit, miscast
    if (this.preData.malignantInfluence)
      if (Number(this.result.roll.toString().split('').pop()) == 8)
        miscastCounter++;

    // Witchcraft automatically miscast
    if (this.item.lore.value == "witchcraft") {
      miscastCounter++;
      this.result.other.push(game.i18n.localize("CHAT.WitchcraftMiscast"))
    }

    // slOver is the amount of SL over the CN achieved
    let slOver = (Number(this.result.SL) - CNtoUse)

    // Test itself was failed
    if (this.result.outcome == "failure") {
      this.result.castOutcome = "failure"
      this.result.description = game.i18n.localize("ROLL.CastingFailed")
      if (this.item.cn.SL) {
        miscastCounter++
        this.result.other.push(game.i18n.localize("CHAT.ChannellingMiscast"))
      }
      // Miscast on fumble
      if (this.result.roll % 11 == 0 || this.result.roll == 100) {
        this.result.color_red = true;
        miscastCounter++;
      }
    }
    else if (slOver < 0) // Successful test, but unable to cast due to not enough SL
    {
      this.result.castOutcome = "failure"
      this.result.description = game.i18n.localize("ROLL.CastingFailed")

      // Critical Casting - succeeds only if the user chooses Total Power option (which is assumed)
      if (this.result.roll % 11 == 0) {
        this.result.color_green = true;
        this.result.description = game.i18n.localize("ROLL.CastingSuccess")
        this.result.critical = game.i18n.localize("ROLL.TotalPower")

      }
    }

    else // Successful test, casted - determine overcast
    {
      this.result.castOutcome = "success"
      this.result.description = game.i18n.localize("ROLL.CastingSuccess")
      let overcasts = Math.floor(slOver / 2);
      this.result.overcast.total = overcasts;
      this.result.overcast.available = overcasts;


      if (this.result.roll % 11 == 0) {
        this.result.critical = game.i18n.localize("ROLL.CritCast")
        this.result.color_green = true;
      }
    }

    this._handleMiscasts(miscastCounter)
    this._calculateDamage()


    return this.result;
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

  _calculateDamage() {
    this.result.additionalDamage = this.preData.additionalDamage || 0
    // Calculate Damage if the this.item has it specified and succeeded in casting
    try {
      if (this.item.Damage && this.result.castOutcome == "success")
        this.result.damage = Number(this.result.SL) + Number(this.item.Damage)

      if (this.item.damage.dice && !this.result.additionalDamage) {
        let roll = new Roll(this.item.damage.dice).roll()
        this.result.diceDamage = { value: roll.total, formula: roll.formula };
        this.result.additionalDamage += roll.total;
      }
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("ErrorDamageCalc") + ": " + error)
    } // If something went wrong calculating damage, do nothing and continue

  }

  get hasIngredient() {
    return this.item.ingredient && this.item.ingredient.quantity.value > 0
  }

  get spell() {
    return this.item
  }

}
