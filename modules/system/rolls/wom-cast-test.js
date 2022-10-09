import CastTest from "./cast-test.js"

export default class WomCastTest extends CastTest {

  _calculateOverCast(slOver) {

    this.result.overcasts = Math.max(0, slOver);    
    this.result.overcast.total = this.result.overcasts;
    this.result.overcast.available = this.result.overcasts;
    if (this.result.overcast.usage.range) {
      this.result.overcast.usage.range.available = this.result.overcast.available >= game.wfrp4e.config.overCastTable.range[0].cost
    }
    if (this.result.overcast.usage.target) {
      if(this.result.overcast.usage.target.AoE) {
        this.result.overcast.usage.target.available = this.result.overcast.available >= game.wfrp4e.config.overCastTable.AoE[0].cost
      } else {
        this.result.overcast.usage.target.available = this.result.overcast.available >= game.wfrp4e.config.overCastTable.target[0].cost
      }
    }
    if (this.result.overcast.usage.duration) {
      this.result.overcast.usage.duration.available = this.result.overcast.available >= game.wfrp4e.config.overCastTable.duration[0].cost
    }
    if (this.result.overcast.usage.damage) {
      this.result.overcast.usage.damage.available = this.result.overcast.available >= game.wfrp4e.config.overCastTable.damage[0].cost
    }
  }

  async _calculateDamage() {
    this.result.additionalDamage = this.preData.additionalDamage || 0
    // Calculate Damage if the this.item has it specified and succeeded in casting
    try {
      if (this.item.Damage && this.result.castOutcome == "success") {
        this.result.damage = Number(this.item.Damage)
        if (this.result.overcast.usage.damage && this.result.overcast.usage.damage.count > 0) {
          this.result.additionalDamage += game.wfrp4e.config.overCastTable.damage[this.result.overcast.usage.damage.count - 1].value
        }
      }
      if (this.item.damage.dice && !this.result.additionalDamage) {
        let roll = await new Roll(this.item.damage.dice).roll()
        this.result.diceDamage = { value: roll.total, formula: roll.formula };
        this.preData.diceDamage = this.result.diceDamage
        this.result.additionalDamage += roll.total;
        this.preData.additionalDamage = this.result.additionalDamage;
      }
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("ErrorDamageCalc") + ": " + error)
    } // If something went wrong calculating damage, do nothing and continue
  }


  // @@@@@@@ Overcast functions placed in root class because it is used by both spells and prayers @@@@@@@
  async _overcast(choice) {
    if (!game.settings.get("wfrp4e", "useWoMOvercast")) {
      await super._overcast(choice);
    } else {
      const overcastData = this.result.overcast

      if (!overcastData.available)
        return overcastData

      if (typeof overcastData.usage[choice].initial != "number")
        return overcastData

      const overCastTable = game.wfrp4e.config.overCastTable;
      const count = overcastData.usage[choice].count;

      if (choice == "target" && overcastData.usage.target.AoE) {
        if (!overCastTable["AoE"][count] || overCastTable["AoE"][count].cost > overcastData.available) {
          return overcastData;
        }
      } else {
        if (!overCastTable[choice][count] || overCastTable[choice][count].cost > overcastData.available) {
          return overcastData;
        }
      }

      switch (choice) {
        case "range":
          if (overCastTable[choice][count] && overCastTable[choice][count].cost <= overcastData.available) {
            overcastData.usage[choice].current = overCastTable[choice][count].value * overcastData.usage[choice].initial
          }
          break
        case "target":
          if (overcastData.usage["target"].AoE) {
            if (overCastTable[choice][count] && overCastTable["AoE"][count].cost <= overcastData.available) {
              overcastData.usage[choice].current = overCastTable["AoE"][count].value * overcastData.usage[choice].initial
            }
          } else {
            if (overCastTable[choice][count] && overCastTable["target"][count].cost <= overcastData.available) {
              overcastData.usage[choice].current = overCastTable["target"][count].value + overcastData.usage[choice].initial
            }
          }
          break
        case "duration":
          if (overCastTable[choice][count] && overCastTable[choice][count].cost <= overcastData.available) {
            overcastData.usage[choice].current = overCastTable[choice][count].value * overcastData.usage[choice].initial
          }
          break
        case "damage": 
        if (overCastTable[choice][count] && overCastTable[choice][count].cost <= overcastData.available) {
          overcastData.usage[choice].current = overCastTable[choice][count].value + overcastData.usage[choice].initial
        }
          break
        case "other":
          if (overcastData.valuePerOvercast.type == "value")
            overcastData.usage[choice].current += overcastData.valuePerOvercast.value
          else if (overcastData.valuePerOvercast.type == "SL")
            overcastData.usage[choice].current += (parseInt(this.result.SL) + (parseInt(this.item.computeSpellPrayerFormula(undefined, false, overcastData.valuePerOvercast.additional)) || 0))
          else if (overcastData.valuePerOvercast.type == "characteristic")
            overcastData.usage[choice].current += (overcastData.usage[choice].increment || 0) // Increment is specialized storage for characteristic data so we don't have to look it up
          break
      }

      overcastData.usage[choice].count++;
      if (choice == "target" && overcastData.usage.target.AoE) {
        overcastData.available = overcastData.available - overCastTable["AoE"][count].cost
      } else {
        overcastData.available = overcastData.available - overCastTable[choice][count].cost
      }

      if (overcastData.usage.range) {
        overcastData.usage.range.available = overcastData.available >= overCastTable.range[overcastData.usage.range.count].cost
      }
      if (overcastData.usage.target) {
        if (overcastData.usage.target.AoE) {
          overcastData.usage.target.available = overcastData.available >= overCastTable.AoE[overcastData.usage.target.count].cost
        } else {          
          overcastData.usage.target.available = overcastData.available >= overCastTable.target[overcastData.usage.target.count].cost
        }
      }
      if (overcastData.usage.duration) {
        overcastData.usage.duration.available = overcastData.available >= overCastTable.duration[overcastData.usage.duration.count].cost
      }
      if (overcastData.usage.damage) {
        overcastData.usage.damage.available = overcastData.available >= overCastTable.damage[overcastData.usage.damage.count].cost
      }

      this.data.result.SL = `+${overcastData.available}`
      await this._calculateDamage()
      this.renderRollCard()
    }
  }

  async _overcastReset() {
    if (!game.settings.get("wfrp4e", "useWoMOvercast")) {
      await super._overcastReset();
    } else {
      let overcastData = this.result.overcast
      overcastData.available = overcastData.total;

      if (this.result.overcast.usage.damage && this.result.overcast.usage.damage.count > 0) {
        this.result.damage -= game.wfrp4e.config.overCastTable.damage[this.result.overcast.usage.damage.count -1].value
      }

      for (let overcastType in overcastData.usage) {
        if (overcastData.usage[overcastType]) {
          overcastData.usage[overcastType].count = 0
          overcastData.usage[overcastType].current = overcastData.usage[overcastType].initial
          if(overcastType == "target" && overcastData.usage.target.AoE) {
            overcastData.usage[overcastType].available = overcastData.available >= game.wfrp4e.config.overCastTable.AoE[0].cost
          } else {
            overcastData.usage[overcastType].available = overcastData.available >= game.wfrp4e.config.overCastTable[overcastType][0].cost
          }
        }
      }

      this.data.result.additionalDamage = this.preData.additionalDamage || 0
      this.data.result.SL = `+${overcastData.total}`
      await this._calculateDamage()
      this.renderRollCard()
    }
  }
}
