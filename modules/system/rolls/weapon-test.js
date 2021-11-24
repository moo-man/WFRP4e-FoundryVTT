import TestWFRP from "./test-wfrp4e.js"
import ItemWfrp4e from "../../item/item-wfrp4e.js";
import WFRP_Utility from "../utility-wfrp4e.js";

export default class WeaponTest extends TestWFRP {

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
    this.preData.charging = data.charging || false;
    this.preData.dualWielding = data.dualWielding || false;

    this.computeTargetNumber();
    this.preData.skillSelected = data.skillSelected instanceof Item ? data.skillSelected.name : data.skillSelected;
  }

  computeTargetNumber() {
    // Determine final target if a characteristic was selected
    try {
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
    catch
    {
      this.preData.target = this.item.skillToUse.total.value
    }

    super.computeTargetNumber();
  }

  async roll() {

    if (this.options.offhand && this.options.offhandReverse)
      this.preData.roll = this.options.offhandReverse

    await super.roll()
    await this.rollWeaponTest();
    this.postTest();
  }

  async rollWeaponTest() {
    let weapon = this.item;

    if (this.result.outcome == "failure") {
      // Dangerous weapons fumble on any failed tesst including a 9
      if (this.result.roll % 11 == 0 || this.result.roll == 100 || (weapon.properties.flaws.dangerous && this.result.roll.toString().includes("9"))) {
        this.result.fumble = game.i18n.localize("Fumble")
        // Blackpowder/engineering/explosive weapons misfire on an even fumble
        if ((weapon.weaponGroup.value == "blackpowder" ||
          weapon.weaponGroup.value == "engineering" ||
          weapon.weaponGroup.value == "explosives") &&
          this.result.roll % 2 == 0) {
          this.result.misfire = game.i18n.localize("Misfire")
          this.result.misfireDamage = eval(parseInt(this.result.roll.toString().split('').pop()) + weapon.Damage)
        }
      }
      if (weapon.properties.flaws.unreliable)
        this.result.SL--;
      if (weapon.properties.qualities.practical)
        this.result.SL++;

      if (weapon.weaponGroup.value == "throwing")
        this.result.scatter = game.i18n.localize("Scatter");
    }
    else // if success
    {
      if (weapon.properties.qualities.blast)
        this.result.other.push(`<a class='aoe-template'><i class="fas fa-ruler-combined"></i>${weapon.properties.qualities.blast.value} yard Blast</a>`)

      if (this.result.roll % 11 == 0)
        this.result.critical = game.i18n.localize("Critical")

      // Impale weapons crit on 10s numbers
      if (weapon.properties.qualities.impale && this.result.roll % 10 == 0)
        this.result.critical = game.i18n.localize("Critical")
    }

    await this._calculateDamage()


    return this.result;
  }

  async _calculateDamage() {
    let weapon = this.weapon
    this.result.additionalDamage = this.preData.additionalDamage || 0

    let damageToUse = this.result.SL; // Start out normally, with SL being the basis of damage
    if (this.useMount && this.actor.mount.characteristics.s.bonus > this.actor.characteristics.s.bonus)
      this.result.damage = eval(weapon.mountDamage + damageToUse)
    else
      this.result.damage = eval(weapon.Damage + damageToUse);

    if (this.result.charging && !this.result.other.includes(game.i18n.localize("Charging")))
      this.result.other.push(game.i18n.localize("Charging"))

    if ((weapon.properties.flaws.tiring && this.result.charging) || !weapon.properties.flaws.tiring) {
      let unitValue = Number(this.result.roll.toString().split("").pop())
      unitValue = unitValue == 0 ? 10 : unitValue; // If unit value == 0, use 10

      if (weapon.properties.qualities.damaging && unitValue > Number(this.result.SL))
        damageToUse = unitValue; // If damaging, instead use the unit value if it's higher

      if (this.useMount && this.actor.mount.characteristics.s.bonus > this.actor.characteristics.s.bonus)
        this.result.damage = eval(weapon.mountDamage + damageToUse)
      else
        this.result.damage = eval(weapon.Damage + damageToUse);

      // Add unit die value to damage if impact
      if (weapon.properties.qualities.impact)
        this.result.damage += unitValue;
    }

    if (weapon.damage.dice && !this.result.additionalDamage) {
      let roll = await new Roll(weapon.damage.dice).roll()
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

  postTest() {
    super.postTest()
    let target = this.targets[0];
    if (target) {
      let impenetrable = false
      let AP = target.status.armour[this.result.hitloc.result]
      for(let layer of AP.layers)
      {
        if (layer.impenetrable)
          impenetrable = true;
      }
      if (impenetrable && this.result.roll % 2 != 0)
      {
        delete this.result.critical
        this.result.nullcritical = `${game.i18n.localize("CHAT.CriticalsNullified")} (${game.i18n.localize("PROPERTY.Impenetrable")})`
      }
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
    if (typeof this.data.preData.item == "string")
      return actor.items.get(this.data.preData.item)
    else
      return new CONFIG.Item.documentClass(this.data.preData.item, { parent: actor })
  }
}
