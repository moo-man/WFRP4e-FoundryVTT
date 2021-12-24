import TestWFRP from "./test-wfrp4e.js"

export default class CastTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.preData.itemData = data.itemData || this.item.toObject() // Store item data to avoid rerolls being affected by changed channeled SL
    this.preData.skillSelected = data.skillSelected;
    this.data.preData.malignantInfluence = data.malignantInfluence

    this.computeTargetNumber();
    this.preData.skillSelected = data.skillSelected instanceof Item ? data.skillSelected.name : data.skillSelected;
  }

  computeTargetNumber() {
    try {

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
      else
        this.preData.target = this.item.skillToUse.total.value

    }
    catch {
      this.preData.target = this.item.skillToUse.total.value
    }

    super.computeTargetNumber();
  }

  async roll() {
    await super.roll()
    await this._rollCastTest();
    this.postTest();
  }

  async _rollCastTest() {
    let miscastCounter = 0;
    let CNtoUse = this.item.cn.value
    this.data.result.overcast = duplicate(this.item.overcast)
    this.result.tooltips.miscast = []

    // Partial channelling - reduce CN by SL so far
    if (game.settings.get("wfrp4e", "partialChannelling")) {
      CNtoUse -= this.preData.itemData.data.cn.SL;
    }
    // Normal Channelling - if SL has reached CN, CN is considered 0
    else if (this.preData.itemData.data.cn.SL >= this.item.cn.value) {
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
      if (this.preData.itemData.data.cn.SL) {
        miscastCounter++
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.ChannellingMiscast"))
      }
      // Miscast on fumble
      if (this.result.roll % 11 == 0 || this.result.roll == 100) {
        this.result.color_red = true;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.FumbleMiscast"))
        miscastCounter++;
        //@HOUSE
        if (this.result.roll == 100 && game.settings.get("wfrp4e", "mooCatastrophicMiscasts"))
        {
          game.wfrp4e.utility.logHomebrew("mooCatastrophicMiscasts")
          miscastCounter++
        }
        //@/HOUSE
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
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.TotalPowerMiscast"))
        miscastCounter++;
      }
    }

    else // Successful test, casted - determine overcast
    {
      this.result.castOutcome = "success"
      this.result.description = game.i18n.localize("ROLL.CastingSuccess")
      this.result.overcasts = Math.floor(slOver / 2);
      this.result.overcast.total = this.result.overcasts;
      this.result.overcast.available = this.result.overcasts;

      if (this.result.roll % 11 == 0) {
        this.result.critical = game.i18n.localize("ROLL.CritCast")
        this.result.color_green = true;
        this.result.tooltips.miscast.push(game.i18n.localize("CHAT.CritCastMiscast"))
        miscastCounter++;
      }

      //@HOUSE
      if (game.settings.get("wfrp4e", "mooCriticalChannelling"))
      {
        game.wfrp4e.utility.logHomebrew("mooCriticalChannelling")
        if (this.spell.data.flags.criticalchannell && CNtoUse == 0)
        {
          this.result.SL = "+" + Number(this.result.SL) + this.item.data._source.data.cn.value
          this.result.other.push("Critical Channelling SL Bonus")
        }
      }
      //@/HOUSE

    }

    this._handleMiscasts(miscastCounter)
    await this._calculateDamage()

    // TODO handle all tooltips (when they are added) in one place
    // TODO Fix weird formatting in tooltips (indenting)
    this.result.tooltips.miscast = this.result.tooltips.miscast.join("\n")

    return this.result;
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
        this.preData.additionalDamage  = this.result.additionalDamage;
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
