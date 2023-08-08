import AttackTest from "./attack-test.js";
import TestWFRP from "./test-wfrp4e.js"

export default class TraitTest extends AttackTest {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return
    this.preData.charging = data.charging || false;
    this.preData.champion = data.champion || false;
    this.preData.options.characteristicToUse = data.characteristicToUse
    this.computeTargetNumber();
  }

  computeTargetNumber() {

    try {
      // Use skill total if characteristics match, otherwise add the total up manually
      if (this.preData.options.characteristicToUse && this.preData.options.characteristicToUse != this.item.rollable.rollCharacteristic)
        this.result.target = this.actor.characteristics[this.preData.options.characteristicToUse].value
      else
        this.result.target = this.actor.characteristics[this.item.rollable.rollCharacteristic].value

      if (this.item.skillToUse)
        this.result.target += this.item.skillToUse.advances.value
    }
    catch
    {
      this.result.target += this.item.skillToUse.advances.value
    }

    super.computeTargetNumber();
  }
  
  async runPreEffects() {
    await super.runPreEffects();
    await this.actor.runEffects("preRollTraitTest", { test: this, cardOptions: this.context.cardOptions })
  }

  async runPostEffects() {
    await super.runPostEffects();
    await this.actor.runEffects("rollTraitTest", { test: this, cardOptions: this.context.cardOptions }, {item : this.item})
    Hooks.call("wfrp4e:rollTraitTest", this, this.context.cardOptions)
  }

  async calculateDamage() {
    try {
      // If the specification of a trait is a number, it's probably damage. (Animosity (Elves) - not a number specification: no damage)
      if (this.item.rollable.damage) {
        this.result.additionalDamage = this.preData.additionalDamage || 0

        await super.calculateDamage(this.item.rollable.SL ? Number(this.result.SL) : 0)

        if (this.item.rollable.dice && !this.result.additionalDamage) {
          let roll = await new Roll(this.item.rollable.dice).roll()
          this.result.diceDamage = { value: roll.total, formula: roll.formula };
          this.preData.diceDamage = this.result.diceDamage
          this.result.additionalDamage += roll.total;
          this.preData.additionalDamage  = this.result.additionalDamage;
        }

        //@HOUSE
        if (game.settings.get("wfrp4e", "mooRangedDamage"))
        {
          game.wfrp4e.utility.logHomebrew("mooRangedDamage")
          if (this.item.attackType == "ranged")
          {
            this.result.damage -= (Math.floor(this.targetModifiers / 10) || 0)
            if (this.result.damage < 0)
              this.result.damage = 0
          }
        }
        //@/HOUSE

      }
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("CHAT.DamageError") + " " + error)
    } // If something went wrong calculating damage, do nothing and still render the card

  }

  get trait() {
    return this.item
  }

  async postTest() {
    await super.postTest();
  
    let target = this.targets[0];
    if (target) {
      let impenetrable = false;
      let AP = target.status.armour[this.result.hitloc.result];
      for (let layer of AP.layers) {
        if (layer.impenetrable) {
          impenetrable = true;
          break
        }
      }
      if (this.result.critical && impenetrable && this.result.roll % 2 != 0 && this.trait.system.rollable.damage) {
        delete this.result.critical;
        this.result.nullcritical = `${game.i18n.localize("CHAT.CriticalsNullified")} (${game.i18n.localize("PROPERTY.Impenetrable")})`
      }
    }
  }

    get characteristicKey() {
    if (this.preData.options.characteristicToUse)
      return this.preData.options.characteristicToUse
    else
      return this.item.rollable.rollCharacteristic
  }
}
