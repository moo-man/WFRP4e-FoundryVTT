import WFRP_Utility from "../utility-wfrp4e.js";
import AttackTest from "./attack-test.js";

export default class WeaponTest extends AttackTest {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return
    this.preData.ammoId = data.ammo?.id // TODO vehicle shit
    this.preData.skillSelected = data.skillSelected || {};
    this.preData.charging = data.charging || false;
    this.preData.champion = data.champion || false;
    this.preData.riposte = data.riposte || false;
    this.preData.infighter = data.infighter || false;
    this.preData.resolute = data.resolute || 0;
    this.preData.dualWielding = data.dualWielding || false;

    this.computeTargetNumber();
    this.preData.skillSelected = data.skillSelected instanceof Item ? data.skillSelected.name : data.skillSelected;
  }

  computeTargetNumber() {
    // Determine final target if a characteristic was selected
    try {
      if (this.preData.skillSelected.char)
        this.result.target = this.actor.characteristics[this.preData.skillSelected.key].value

      else if (this.preData.skillSelected.name == this.item.getSkillToUse(this.actor).name)
        this.result.target = this.item.getSkillToUse(this.actor).total.value

      else if (typeof this.preData.skillSelected == "string") {
        let skill = this.actor.getItemTypes("skill").find(s => s.name == this.preData.skillSelected)
        if (skill)
          this.result.target = skill.total.value
      }
      else
        this.result.target = this.item.getSkillToUse(this.actor).total.value
    }
    catch
    {
      this.result.target = this.item.getSkillToUse(this.actor).total.value
    }

    super.computeTargetNumber();
  }

  async runPreEffects() {
    await super.runPreEffects();
    await this.actor.runEffects("preRollWeaponTest", { test: this, cardOptions: this.context.cardOptions })
  }

  async runPostEffects() {
    await super.runPostEffects();
    await this.actor.runEffects("rollWeaponTest", { test: this, cardOptions: this.context.cardOptions }, {item : this.item})
    Hooks.call("wfrp4e:rollWeaponTest", this, this.context.cardOptions)
  }


  async roll() {

    if (this.options.offhand && this.options.offhandReverse)
      this.preData.roll = this.options.offhandReverse

    await super.roll()
  }

  async computeResult()
  {
    await super.computeResult()
    this.computeMisfire();
  }


  async calculateDamage() {
    super.calculateDamage(this.result.SL);
    let weapon = this.weapon;

    if ((weapon.damage.dice || weapon.ammo?.damage.dice) && !this.result.additionalDamage) {
      let roll = await new Roll(weapon.damage.dice + `${weapon.ammo?.damage.dice ? "+" + weapon.ammo?.damage.dice : "" }`).roll()
      this.result.diceDamage = { value: roll.total, formula: roll.formula };
      this.preData.diceDamage = this.result.diceDamage
      this.result.additionalDamage += roll.total;
      this.preData.additionalDamage  = this.result.additionalDamage;
    }

    //@HOUSE
    if (game.settings.get("wfrp4e", "mooRangedDamage"))
    {
      game.wfrp4e.utility.logHomebrew("mooRangedDamage")
      if (weapon.attackType == "ranged")
      {
        this.result.damage -= (Math.floor(this.targetModifiers / 10) || 0)
        if (this.result.damage < 0)
          this.result.damage = 0
      }
    }
    //@/HOUSE
  }

  async postTest() {
    await super.postTest()

    let target = this.targets[0];
    if (target) {
      let impenetrable = false
      let AP = target.status.armour[this.result.hitloc.result]
      for(let layer of AP.layers)
      {
        if (layer.impenetrable)
          impenetrable = true;
      }
      if (this.result.critical && impenetrable && this.result.roll % 2 != 0) {
        delete this.result.critical
        this.result.nullcritical = `${game.i18n.localize("CHAT.CriticalsNullified")} (${game.i18n.localize("PROPERTY.Impenetrable")})`
      }
    }

    await this.handleAmmo();
    await this.handleDualWielder();

  }

  async handleAmmo()
  {
    // Only subtract ammo on the first run, so not when edited, not when rerolled
    if (this.item.ammo && this.item.consumesAmmo.value && !this.context.edited && !this.context.reroll) {
      await this.item.ammo.update({ "system.quantity.value": this.item.ammo.quantity.value - 1 })
    }
    else if (this.preData.ammoId && this.item.consumesAmmo.value && !this.context.edited && !this.context.reroll) {
      let ammo = this.actor.items.get(this.preData.ammoId)
      await ammo.update({ "system.quantity.value": this.actor.items.get(this.preData.ammoId).quantity.value - 1 })
    }


    if (this.item.loading && !this.context.edited && !this.context.reroll) {
      this.item.loaded.amt--;
      if (this.item.loaded.amt <= 0) {
        this.item.loaded.amt = 0
        this.item.loaded.value = false;

        let item = await this.item.update({ "system.loaded.amt": this.item.loaded.amt, "system.loaded.value": this.item.loaded.value });
        await this.actor.checkReloadExtendedTest(item);
      }
      else {
        await this.item.update({ "system.loaded.amt": this.item.loaded.amt })
      }
    }
  }

  async handleDualWielder() 
  {
    if (this.preData.dualWielding && !this.context.edited) {
      let offHandData = duplicate(this.preData)

      if (!this.actor.hasSystemEffect("dualwielder"))
        await this.actor.addSystemEffect("dualwielder")

      if (this.result.outcome == "success") {
        let offhandWeapon = this.actor.getItemTypes("weapon").find(w => w.offhand.value);
        if (this.result.roll % 11 == 0 || this.result.roll == 100)
          delete offHandData.roll
        else {
          let offhandRoll = this.result.roll.toString();
          if (offhandRoll.length == 1)
            offhandRoll = offhandRoll[0] + "0"
          else
            offhandRoll = offhandRoll[1] + offhandRoll[0]
          offHandData.roll = Number(offhandRoll);
        }

        this.actor.setupWeapon(offhandWeapon, { appendTitle: ` (${game.i18n.localize("SHEET.Offhand")})`, offhand: true, offhandReverse: offHandData.roll }).then(test => test.roll());
      }
    }
  }

  computeMisfire() {
    let weapon = this.item;
    // Blackpowder/engineering/explosive weapons misfire on an even fumble
    if (this.result.fumble && 
      ["blackpowder", "engineering", "explosives"].includes(weapon.weaponGroup.value) && 
      this.result.roll % 2 == 0) 
    {
      this.result.misfire = game.i18n.localize("Misfire")
      this.result.misfireDamage = (0, eval)(parseInt(this.result.roll.toString().split('').pop()) + weapon.Damage)
    }
  }

  get weapon() {
    return this.item
  }

  get vehicle() {
    if (this.options.vehicle)
      return WFRP_Utility.getSpeaker(this.options.vehicle)
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

  get item() {
    let actor = this.vehicle || this.actor
    if (typeof this.preData.item == "string")
      return actor.items.get(this.preData.item)
    else
      return new CONFIG.Item.documentClass(this.preData.item, { parent: actor })
  }
}
