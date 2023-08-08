import TestWFRP from "./test-wfrp4e.js"
import ItemWfrp4e from "../../item/item-wfrp4e.js";
import WFRP_Utility from "../utility-wfrp4e.js";

export default class AttackTest extends TestWFRP {


  async computeResult() {
    await super.computeResult();

    this.computeProperties();

    await this.calculateDamage()

    return this.result;
  }

  computeProperties()
  {
    if (this.result.outcome == "failure") {
      // Dangerous weapons fumble on any failed tesst including a 9
      if (this.result.roll % 11 == 0 || this.result.roll == 100 || (this.item.properties.flaws.dangerous && this.result.roll.toString().includes("9"))) {
        this.result.fumble = game.i18n.localize("Fumble")
      }
      if (this.item.properties.flaws.unreliable)
        this.result.SL--;
      if (this.item.properties.qualities.practical)
        this.result.SL++;

      if (this.item.weaponGroup?.value == "throwing")
        this.result.scatter = game.i18n.localize("Scatter");
    }
    else // if success
    {
      if (this.item.properties.qualities.blast)
        this.result.other.push(`<a class='aoe-template' data-type="radius"><i class="fas fa-ruler-combined"></i>${this.item.properties.qualities.blast.value} yard Blast</a>`)

      if (this.result.roll % 11 == 0)
        this.result.critical = game.i18n.localize("Critical")

      // Impale weapons crit on 10s numbers
      if (this.item.properties.qualities.impale && this.result.roll % 10 == 0)
        this.result.critical = game.i18n.localize("Critical")

      if (this.result.critical && this.item.properties.qualities.slash)
      {
          this.result.other.push(`${game.i18n.format("PROPERTY.SlashAlert", {value : parseInt(this.item.properties.qualities.slash.value)})}`)
      }
    }
  }

  async calculateDamage(base)
  {
    this.result.additionalDamage = this.preData.additionalDamage || 0

    let damageToUse = base; // Start out normally, with SL being the basis of damage
    if (this.useMount && this.actor.mount.characteristics.s.bonus > this.actor.characteristics.s.bonus)
      this.result.damage = (0, eval)(this.item.mountDamage + damageToUse)
    else
      this.result.damage = (0, eval)(this.item.Damage + damageToUse);

    if (this.result.charging && !this.result.other.includes(game.i18n.localize("Charging")))
      this.result.other.push(game.i18n.localize("Charging"))

    if ((this.item.properties.flaws.tiring && this.result.charging) || !this.item.properties.flaws.tiring) {
      let unitValue = Number(this.result.roll.toString().split("").pop())
      unitValue = unitValue == 0 ? 10 : unitValue; // If unit value == 0, use 10

      if (this.item.properties.qualities.damaging && unitValue > Number(this.result.SL))
        base = unitValue; // If damaging, instead use the unit value if it's higher

      if (this.useMount && this.actor.mount.characteristics.s.bonus > this.actor.characteristics.s.bonus)
        this.result.damage = (0, eval)(this.item.mountDamage + damageToUse)
      else
        this.result.damage = (0, eval)(this.item.Damage + damageToUse);

      // Add unit die value to damage if impact
      if (this.item.properties.qualities.impact)
        this.result.damage += unitValue;
    }

    if (this.item.properties.qualities.spread)
    {
      let value = (Number(this.item.properties.qualities.spread.value) || 0)
      if (this.preData.options.rangeBand == game.i18n.localize("Point Blank"))
      {
        this.result.additionalDamage += value;        
        this.result.damage += value;
        this.preData.other.push(game.i18n.format("CHAT.SpreadPointBlank", {damage : value}))
      }
      else if (this.preData.options.rangeBand == game.i18n.localize("Extreme"))
      {
        this.result.additionalDamage -= value;        
        this.result.damage -= value;
        this.preData.other.push(game.i18n.format("CHAT.SpreadExtreme", {damage : value}))
      }
    }
  }
}