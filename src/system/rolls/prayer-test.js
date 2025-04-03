import TestWFRP from "./test-wfrp4e.js"

export default class PrayerTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return
    this.computeTargetNumber();

  }

  static fromData(...args)
  {
    return new this(...args);
  }

  computeTargetNumber() {
    let skill = this.item.system.getSkillToUse(this.actor);
    if (!skill)
      this.result.target = this.actor.characteristics.fel.value
    else
      this.result.target = skill.total.value

    super.computeTargetNumber();
  }

  async runPreEffects() {
    await super.runPreEffects();
    await Promise.all(this.actor.runScripts("preRollPrayerTest", { test: this, chatOptions: this.context.chatOptions }))
    await Promise.all(this.item.runScripts("preRollPrayerTest", { test: this, chatOptions: this.context.chatOptions }))
  }

  async runPostEffects() {
    await super.runPostEffects();
    await Promise.all(this.actor.runScripts("rollPrayerTest", { test: this, chatOptions: this.context.chatOptions }))
    await Promise.all(this.item.runScripts("rollPrayerTest", { test: this, chatOptions: this.context.chatOptions }))
    Hooks.call("wfrp4e:rollPrayerTest", this, this.context.chatOptions)
  }

  async computeResult() {
    await super.computeResult();
    let SL = this.result.SL;
    let currentSin = this.actor.status.sin.value
    this.result.overcast = foundry.utils.duplicate(this.item.overcast)

    // Test itself failed
    if (this.failed) {
      this.result.description = game.i18n.localize("ROLL.PrayRefused")

      // Wrath of the gads activates if ones digit is equal or less than current sin
      let unitResult = Number(this.result.roll.toString().split('').pop())
      if (unitResult == 0)
        unitResult = 10;
      if (this.result.roll % 11 == 0 || unitResult <= currentSin) {
        if (this.result.roll % 11 == 0)
          this.result.color_red = true;

        this.result.wrath = game.i18n.localize("ROLL.Wrath")
        this.result.wrathModifier = Number(currentSin) * 10;
      }
    }
    // Test succeeded
    else {
      this.result.description = game.i18n.localize("ROLL.PrayGranted")

      // Wrath of the gads activates if ones digit is equal or less than current sin      
      let unitResult = Number(this.result.roll.toString().split('').pop())
      if (unitResult == 0)
        unitResult = 10;
      if (unitResult <= currentSin) {
        this.result.wrath = game.i18n.localize("ROLL.Wrath")
        this.result.wrathModifier = Number(currentSin) * 10;
      }
    }

    this.result.overcasts = Math.max(0, Math.floor(SL / 2)); // For allocatable buttons
    this.result.overcast.total = this.result.overcasts
    this.result.overcast.available = this.result.overcast.total;

    await this.calculateDamage()
  }


  async calculateDamage() {
    let damageBreakdown = this.result.breakdown.damage;
    this.result.additionalDamage = this.preData.additionalDamage || 0
    // Calculate damage if prayer specifies
    try {
      if (this.item.DamageString && this.succeeded)
      {
        this.result.damage = Number(this.item.Damage)
        damageBreakdown.base = `${this.item.Damage} (Prayer)`;
      }
      if (this.item.damage.addSL)
      {
        this.result.damage = Number(this.result.SL) + (this.result.damage || 0)
        damageBreakdown.other.push({label : game.i18n.localize(`SL`), value : this.result.SL});
      }

      if (this.item.damage.dice && !this.result.additionalDamage) {
        let roll = await new Roll(this.item.damage.dice).roll({allowInteractive : false})
        this.result.diceDamage = { value: roll.total, formula: roll.formula };
        this.preData.diceDamage = this.result.diceDamage
        this.result.additionalDamage += roll.total;
        damageBreakdown.other.push({label : game.i18n.localize("BREAKDOWN.Dice"), value : roll.total});
        this.preData.additionalDamage = this.result.additionalDamage;
      }
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("ErrorDamageCalc") + ": " + error)
    } // If something went wrong calculating damage, do nothing and still render the card
  }

  computeTables()
  {
    super.computeTables();
    if (this.result.wrath)
    {
      this.result.tables.wrath = {
        label : this.result.wrath,
        class : "fumble-roll",
        modifier : this.result.wrathModifier,
        key : "wrath"
      }
    }
  }

  async postTest() {
    if (this.result.wrath) {
      let sin = this.actor.status.sin.value - 1
      if (sin < 0) sin = 0
      this.actor.update({ "system.status.sin.value": sin });
      ui.notifications.notify(game.i18n.localize("SinReduced"));
    }
  }

  
  // @@@@@@@ Overcast functions placed in root class because it is used by both spells and prayers @@@@@@@
  async _overcast(choice) {
    if (this.result.overcast.usage[choice].AoE && !this.item.system.target.extendableAoE) {
      ui.notifications.error(game.i18n.localize("ERROR.PrayerAoEOvercast"))
    } else {
      await super._overcast(choice)
    }
  }

  get prayer() {
    return this.item
  }
}