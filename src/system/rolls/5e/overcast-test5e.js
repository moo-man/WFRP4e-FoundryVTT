import SkillTest5e from "./skill-test5e";

export default class OvercastableTest5e extends SkillTest5e {
  
  constructor(data)
  {
    super(data);
    if (!data) return
    this.testData.overcastSpending = {}
  }

  initializeOvercasts()
  {
    let damage = parseInt(this.item.system.computeSpellDamage(this.item.system.damage.value, {actor: this.actor, isMagicMissile: this.item.system.magicMissile?.value}) || 0)
    let targets = this.item.system.computeSpellPrayerFormula("target", {actor: this.actor, aoe: this.item.system.target.aoe})?.toString();
    let duration = this.item.system.computeSpellPrayerFormula("duration", {actor: this.actor})
    let range = this.item.system.computeSpellPrayerFormula("range", {actor: this.actor})
    let aoeValue = targets.substring(targets.indexOf("(") + 1, targets.length - 1)

    let isPetty = this.item.system.lore.value.includes("petty");

    this.result.overcasts = {
      total: 0,
      available: 0,
      options : {
        damage: {
          label: game.i18n.localize("Damage"),
          initial: parseInt(damage) || damage,
          allowed: !isNaN(damage) && !isPetty
        },
        targets: {
          label: this.item.system.target.aoe ? game.i18n.localize("AoE") : game.i18n.localize("Target"),
          allowed: (this.item.system.target.aoe || !isNaN(targets)) && !this.item.system.target.maximum && !isPetty,
          initial: this.item.system.target.aoe ? (parseInt(aoeValue) || aoeValue) : parseInt(this.item.system.target.value),
          aoe: this.item.system.target.aoe,
          unit: aoeValue.split(" ")[1]
        },
        duration: {
          label: game.i18n.localize("Duration"),
          allowed: !isNaN(duration.split(" ")[0]) && !this.item.system.duration.maximum && !isPetty,
          initial: parseInt(duration) || duration,
          unit: duration.split(" ")[1],
        },
        range: {
          label: game.i18n.localize("Range"),
          allowed: !isNaN(range.split(" ")[0]) && !this.item.system.range.maximum && !isPetty,
          initial: parseInt(range) || range,
          unit: range.split(" ")[1],
        },
        other: {}
      }
    }

    for(let key in this.item.system.overcastOptions)
    {
      let option = this.item.system.overcastOptions[key];
      if (option.initial && option.value)
      {
        this.result.overcasts.options.other[key] = {
          label: option.label,
          allowed: true,
          cost: option.cost,
          property: option.property,
          initial: Roll.safeEval(Roll.getFormula(Roll.parse(option.initial, {test: this, actor: this.actor}))),
          value: Roll.safeEval(Roll.getFormula(Roll.parse(option.value, {test: this, actor: this.actor}))),
        }
      }
    }
  }

  computeOvercasts()
  {
    this.result.overcasts.total = this.result.excessSL;
    if (this.result.criticalCastChoice == "totalPower") // Add tens digit to overcasting available
    {
      this.result.overcasts.total += Math.trunc(this.result.roll / 10);
    }
    this.result.overcasts.total = Math.min(this.result.overcasts.total, this.actor.system.characteristics.wp.bonus + this.actor.system.characteristics.int.bonus) // Can't spent more than IntB + WPB
    let totalSpent = Object.values(this.testData.overcastSpending).reduce((a, b) => a + b, 0);
    this.result.overcasts.available = this.result.overcasts.total - totalSpent

    for(let key of ["damage", "targets", "range", "duration"].concat(Object.keys(this.result.overcasts.options.other)))
    {
      if (["damage", "targets", "range", "duration"].includes(key))
      {

        let costKey = key;
        // AoE and normal targeting is different in terms of overcast cost
        if (key == "targets")
        {
          costKey = this.result.overcasts.options.targets.aoe ? "aoe" : "targets";
        }

        // Compute cost of next overcast, determine availability
        this.result.overcasts.options[key].cost = this._getNextOvercastSpend(costKey, this.testData.overcastSpending[key]);
        this.result.overcasts.options[key].available = this.result.overcasts.options[key].cost - (this.testData.overcastSpending[key] || 0) <= this.result.overcasts.available;

        // Get value based on how much spent on overcast
        let value = this._getOvercastValue(costKey, this.testData.overcastSpending[key] || 0)
        let initial = this.result.overcasts.options[key].initial;


        // Some overcasts multiply, others add
        if (["aoe", "range", "duration"].includes(costKey))
        {
          this.result.overcasts.options[key].value = initial * (value || 1);
        }
        else 
        {
          this.result.overcasts.options[key].value = initial + value;
        }

        // Put data into result for easy access
        if (this.result.overcasts.options[key].unit)
        {
          this.result[key] = {
            value: this.result.overcasts.options[key].value,
            unit:  this.result.overcasts.options[key].unit,
            aoe: this.result.overcasts.options[key].aoe
          }
        }
        else
        {
          this.result[key] = this.result.overcasts.options[key].value;
        }
      }
      else // Other overcast options, divide spent by how much each overcast costs for the value, add to the initial value, set property in test result
      {
        let otherOption = this.result.overcasts.options.other[key];
        let value = ((this.testData.overcastSpending[key] || 0) / otherOption.cost) * otherOption.value;
        otherOption.value = otherOption.initial + value;
        this.result[otherOption.property] = otherOption.value;
        otherOption.available = this.result.overcasts.available >= otherOption.cost;
      }
    }
  }

  _getOvercastValue(type, spent)
  {
    let table = game.wfrp4e.config.overcastTable[type];
    
    let value = 0;
    // Find the highest cost spent and return the associated value
    for(let i = 0; i < table.length; i++)
    {
      if (spent >= table[i].cost)
      {
        value = table[i].value;
      }
    }
    return value;    
  }

  _getNextOvercastSpend(type, spent = 0)
  {
    let table = game.wfrp4e.config.overcastTable[type];

    if (!table)
    {
      return this.result.overcasts.options.other[type].cost + spent;
    }
    
    // Find the first cost that's higher than the current spent and return that
    for(let i = 0; i < table.length; i++)
    {
      if (spent < table[i].cost)
      {
        return table[i].cost;
      }
    }
  }

  overcast(key) 
  {
    let currentSpent = this.testData.overcastSpending[key] || 0;
    let costKey = key;
    if (key == "targets" && this.result.overcasts.options.targets.aoe)
    {
      costKey = "aoe";
    }
    let cost = this._getNextOvercastSpend(costKey, this.testData.overcastSpending[key]);
    let diff = cost - currentSpent;
    if (diff <= this.result.overcasts.available)
    {
      this.testData.overcastSpending[key] = cost;
      this.roll();
    }
    else 
    {
      ui.notifications.error("Not enough SL!");
    }
  }

  resetOvercasts() 
  {
    this.testData.overcastSpending = new foundry.data.operators.ForcedReplacement({});
    this.roll();
  }
}
