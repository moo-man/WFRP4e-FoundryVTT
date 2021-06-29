import TestWFRP from "./test-wfrp4e.js"

export default class TraitTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return
    this.preData.champion = data.champion || false;
    this.preData.options.characteristicToUse = data.characteristicToUse
    this.computeTargetNumber();
  }

  computeTargetNumber() {

    // Use skill total if characteristics match, otherwise add the total up manually
    if (this.preData.options.characteristicToUse && this.preData.options.characteristicToUse != this.item.rollable.rollCharacteristic)
      this.preData.target = this.actor.characteristics[this.preData.options.characteristicToUse].value
    else
      this.preData.target = this.actor.characteristics[this.item.rollable.rollCharacteristic].value

    if (this.item.skillToUse)
      this.preData.target += this.item.skillToUse.advances.value

    super.computeTargetNumber();
  }

  async roll() {

    await super.roll()
    this._rollTraitTest();
  }

  _rollTraitTest() {
    this._calculateDamage()
  }

  _calculateDamage() {
    try {
      // If the specification of a trait is a number, it's probably damage. (Animosity (Elves) - not a number specification: no damage)
      if (this.item.rollable.damage) {
        this.result.additionalDamage = this.preData.additionalDamage || 0
        this.result.damage = Number(this.item.Specification) || 0

        if (this.item.rollable.SL)
          this.result.damage += Number(this.result.SL)


        if (this.item.rollable.dice && !this.result.additionalDamage) {
          let roll = new Roll(this.item.rollable.dice).roll()
          this.result.diceDamage = { value: roll.total, formula: roll.formula };
          this.result.additionalDamage += roll.total;
        }
      }
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("CHAT.DamageError") + " " + error)
    } // If something went wrong calculating damage, do nothing and still render the card

  }

  get trait() {
    return this.item
  }
}
