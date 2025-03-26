import AttackTest from "./attack-test.js";
import TestWFRP from "./test-wfrp4e.js"

export default class TraitTest extends AttackTest {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return
    this.preData.charging = data.charging || false;
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

      let skill = this.item.system.getSkillToUse(this.actor);

      if (skill)
        this.result.target = skill.total.value
    }
    catch
    {
      this.result.target == skill.total.value
    }

    super.computeTargetNumber();
  }
  
  async runPreEffects() {
    await super.runPreEffects();
    await Promise.all(this.actor.runScripts("preRollTraitTest", { test: this, chatOptions: this.context.chatOptions }))
    await Promise.all(this.item.runScripts("preRollTraitTest", { test: this, chatOptions: this.context.chatOptions }))
  }

  async runPostEffects() {
    await super.runPostEffects();
    await Promise.all(this.actor.runScripts("rollTraitTest", { test: this, chatOptions: this.context.chatOptions }))
    await Promise.all(this.item.runScripts("rollTraitTest", { test: this, chatOptions: this.context.chatOptions }))
    Hooks.call("wfrp4e:rollTraitTest", this, this.context.chatOptions)
  }

  async calculateDamage() {
    try {
      // If the specification of a trait is a number, it's probably damage. (Animosity (Elves) - not a number specification: no damage)
      if (this.item.rollable.damage) {
        let damageBreakdown = this.result.breakdown.damage;
        this.result.additionalDamage = this.preData.additionalDamage || 0

        await super.calculateDamage(this.item.rollable.SL ? Number(this.result.SL) : 0)
        damageBreakdown.item = `+${this.item.Damage} (${[this.item.system.specification.value, game.wfrp4e.config.characteristicsAbbrev[this.item.system.rollable.bonusCharacteristic]].filter(i => i).join(" + ")})`;

        if (this.item.rollable.dice && !this.result.additionalDamage) {
          let roll = await new Roll(this.item.rollable.dice).roll()
          this.result.diceDamage = { value: roll.total, formula: roll.formula };
          this.preData.diceDamage = this.result.diceDamage
          damageBreakdown.other.push({label : game.i18n.localize("BREAKDOWN.Dice"), value : roll.total});
          this.result.additionalDamage += roll.total;
          this.preData.additionalDamage  = this.result.additionalDamage;
        }

        //@HOUSE
        if (game.settings.get("wfrp4e", "mooRangedDamage"))
        {
          game.wfrp4e.utility.logHomebrew("mooRangedDamage")
          if (this.item.isRanged)
          {
            let damageMod = (Math.floor(this.targetModifiers / 10) || 0)
            this.result.damage -= damageMod
            damageBreakdown.other.push({label : game.i18n.localize("BREAKDOWN.Moo"), value : - damageMod});
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

}
