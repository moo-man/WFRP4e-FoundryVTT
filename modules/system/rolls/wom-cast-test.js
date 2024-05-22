import CastTest from "./cast-test.js"

export default class WomCastTest extends CastTest {

  // WoM overcasts need to check availability per usage option
  // Look at each usage's first option and see if the cost can be paid
  // If not, it is not available
  _calculateOverCast(slOver) {

    this.result.overcasts = Math.max(0, slOver) + (this.result.totalPower ? parseInt(Math.floor(this.result.roll / 10)) : 0);    
    this.result.overcast.total = this.result.overcasts;
    this.result.overcast.available = this.result.overcasts;

    // Since SL is spent by overcasts, need to keep track of original
    this.result.overcast.originalSL = Number(this.result.SL) 

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
    if (this.result.overcast.usage.other) {
      this.result.overcast.usage.other.available = this.result.overcast.available >= 2
    }
  }

  async calculateDamage() {
    let damageBreakdown = this.result.breakdown.damage;
    this.result.additionalDamage = this.preData.additionalDamage || 0
    // Calculate Damage if the this.item has it specified and succeeded in casting
    try {
      if (this.item.Damage && this.result.castOutcome == "success") {
        this.result.damage = Number(this.item.Damage)
        damageBreakdown.base = `${this.item.Damage} (${game.i18n.localize("Spell")})`

        if (this.result.overcast.usage.damage && this.result.overcast.usage.damage.count > 0) {
          let overcastDamage = game.wfrp4e.config.overCastTable.damage[this.result.overcast.usage.damage.count - 1].value
          this.result.additionalDamage += overcastDamage
          damageBreakdown.other.push({label : game.i18n.localize("Overcast"), value : overcastDamage});
          this.result.damage += this.result.additionalDamage
        }
      }
      if (this.item.damage.dice && !this.result.additionalDamage) {
        let roll = await new Roll(this.item.damage.dice).roll()
        this.result.diceDamage = { value: roll.total, formula: roll.formula };
        this.preData.diceDamage = this.result.diceDamage
        this.result.additionalDamage += roll.total;
        damageBreakdown.other.push({label : game.i18n.localize("BREAKDOWN.Dice"), value : roll.total});
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


      // If no table entry, or costs more than SL available, do nothing
      // AoE is separate column from target, so must be tested separately 
      if (choice == "target" && overcastData.usage.target.AoE) {
        if (!overCastTable["AoE"][count] || overCastTable["AoE"][count].cost > overcastData.available) {
          return overcastData;
        }
      } 
      // Other options are not in the table, so assume cost is 2 per original rules
      else if (choice == "other") {
        if (2 > overcastData.available)
          return overcastData
      }
      else {
        if (!overCastTable[choice][count] || overCastTable[choice][count].cost > overcastData.available) {
          return overcastData;
        }
      }

      // Set current value based on overcast choice
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
            overcastData.usage[choice].current += (parseInt(this.result.SL) + (parseInt(this.item.system.computeSpellPrayerFormula(undefined, false, overcastData.valuePerOvercast.additional)) || 0))
          else if (overcastData.valuePerOvercast.type == "characteristic")
            overcastData.usage[choice].current += (overcastData.usage[choice].increment || 0) // Increment is specialized storage for characteristic data so we don't have to look it up
          break
      }


      // Subtract cost of overcasting from available SL
      // AoE is separate column from target, so must be tested separately 
      if (choice == "target" && overcastData.usage.target.AoE) {
        overcastData.available = overcastData.available - overCastTable["AoE"][count].cost
      } 
      else if (choice == "other") {
        overcastData.available = overcastData.available - 2
      }
      else {
        overcastData.available = overcastData.available - overCastTable[choice][count].cost
      }

      overcastData.usage[choice].count++;

      // Check if options are still available for more overcasting (now that count is incremented)
      // It is not available if 1). no more entries in the table or 2). not enough available SL
      if (overcastData.usage.range) {
        overcastData.usage.range.available = overCastTable.range[overcastData.usage.range.count] && overcastData.available >= overCastTable.range[overcastData.usage.range.count].cost
      }
      if (overcastData.usage.target) {
        if (overcastData.usage.target.AoE) {
          overcastData.usage.target.available = overCastTable.AoE[overcastData.usage.target.count] && overcastData.available >= overCastTable.AoE[overcastData.usage.target.count].cost
        } else {          
          overcastData.usage.target.available = overCastTable.target[overcastData.usage.target.count] && overcastData.available >= overCastTable.target[overcastData.usage.target.count].cost
        }
      }
      if (overcastData.usage.duration) {
        overcastData.usage.duration.available = overCastTable.duration[overcastData.usage.duration.count] && overcastData.available >= overCastTable.duration[overcastData.usage.duration.count].cost
      }
      if (overcastData.usage.damage) {
        overcastData.usage.damage.available = overCastTable.damage[overcastData.usage.damage.count] && overcastData.available >= overCastTable.damage[overcastData.usage.damage.count].cost
      }

      // Subtract SL by the amount spent on overcasts
      // Math.max is for preventing negative SL, this occurs with Dhar overcast rules from, which don't really work well with WoM overcast
      this.data.result.SL = `+${Math.max(0, overcastData.originalSL - (overcastData.total - overcastData.available))}`
      await this.calculateDamage()
      await this.updateMessageFlags();
      this.renderRollCard()
    }
  }

  async _overcastReset() {
    if (!game.settings.get("wfrp4e", "useWoMOvercast")) {
      await super._overcastReset();
    } else {
      let overcastData = this.result.overcast
      overcastData.available = overcastData.total;

      // For each usage option, set count to 0, reset current value to initial, and check availability
      for (let overcastType in overcastData.usage) {
        if (overcastData.usage[overcastType]) {
          overcastData.usage[overcastType].count = 0
          overcastData.usage[overcastType].current = overcastData.usage[overcastType].initial

          if (overcastType == "other") {
            overcastData.usage[overcastType].available = overcastData.available >= 2
          }
          else if(overcastType == "target" && overcastData.usage.target.AoE) {
            overcastData.usage[overcastType].available = overcastData.available >= game.wfrp4e.config.overCastTable.AoE[0].cost
          } 
          else {
            overcastData.usage[overcastType].available = overcastData.available >= game.wfrp4e.config.overCastTable[overcastType][0].cost
          }
        }
      }

      this.data.result.additionalDamage = this.preData.additionalDamage || 0
      this.data.result.SL = `+${overcastData.originalSL}`
      await this.calculateDamage()
      this.renderRollCard()
    }
  }
}
