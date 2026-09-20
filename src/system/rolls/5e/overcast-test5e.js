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

    this.result.overcasts = {
      total: 0,
      available: 0,
      options : {
        damage: {
          label: game.i18n.localize("Damage"),
          initial: parseInt(damage) || damage,
          allowed: !isNaN(damage) && damage > 0
        },
        targets: {
          label: this.item.system.target.aoe ? game.i18n.localize("AoE") : game.i18n.localize("Target"),
          allowed: (this.item.system.target.aoe || !isNaN(targets)) && !this.item.system.target.maximum,
          initial: this.item.system.target.aoe ? (parseInt(aoeValue) || aoeValue) : parseInt(this.item.system.target.value) || this.item.system.target.value,
          aoe: this.item.system.target.aoe,
          unit: aoeValue.split(" ")[1]
        },
        duration: {
          label: game.i18n.localize("Duration"),
          allowed: !isNaN(duration.split(" ")[0]) && !this.item.system.duration.maximum,
          initial: parseInt(duration) || duration,
          unit: duration.split(" ")[1],
        },
        range: {
          label: game.i18n.localize("Range"),
          allowed: !isNaN(range.split(" ")[0]) && !this.item.system.range.maximum,
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
          initial: option.initial, // Leave as formula for now because @test.result would fail as it's not been computed yet
          value: option.value
        }
      }
    }
  }

  computeOvercasts()
  {
    this._computeOvercastAmount()
    this._computeOtherOvercastFormula()

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


        if (!this.result.overcasts.options[key].allowed)
        {
          this.result.overcasts.options[key].value = initial;
        }
        // Some overcasts multiply, others add
        else if (["aoe", "range", "duration"].includes(costKey))
        {
          this.result.overcasts.options[key].value = initial + (initial * value);
        }
        else 
        {
          this.result.overcasts.options[key].value = initial + value;
        }

        // Put data into result for easy access
        this.result[key] = {
          value: this.result.overcasts.options[key].value,
        }
        if (this.result.overcasts.options[key].unit)
        {
          this.result[key].unit = this.result.overcasts.options[key].unit;
        }
        if (this.result.overcasts.options[key].aoe)
        {
          this.result[key].aoe = this.result.overcasts.options[key].aoe;
        }
      }
      else // Other overcast options, divide spent by how much each overcast costs for the value, add to the initial value, set property in test result
      {
        let otherOption = this.result.overcasts.options.other[key];
        if (otherOption)
        {
          let value = ((this.testData.overcastSpending[key] || 0) / otherOption.cost) * otherOption.value;
          otherOption.value = otherOption.initial + value;
          this.result[otherOption.property] = otherOption.value;
          otherOption.available = this.result.overcasts.available >= otherOption.cost;
        }
      }
    }

    this._formatLegacyOvercasting();
  }

  _computeOtherOvercastFormula()
  {
    for(let key in this.result.overcasts.options.other)
    {
      let option = this.result.overcasts.options.other[key];
      this.result.overcasts.options.other[key].initial = Roll.safeEval(Roll.getFormula(Roll.parse(option.initial, {test: this, actor: this.actor})));
      this.result.overcasts.options.other[key].value = Roll.safeEval(Roll.getFormula(Roll.parse(option.value, {test: this, actor: this.actor})));
    }
  }

  // Compute overcast values available to spend
  _computeOvercastAmount()
  {
    this.result.overcasts.allowed = true;
    this.result.overcasts.total = this.result.SL;
    let totalSpent = Object.values(this.testData.overcastSpending).reduce((a, b) => a + b, 0);
    this.result.overcasts.available = this.result.overcasts.total - totalSpent;
  }

  _formatLegacyOvercasting()
  {
    this.result.overcast = {
      usage: {
        damage : {
          current: this.result.overcasts.options.damage.value
        },
        targets : {
          current: this.result.overcasts.options.targets.value
        },
        duration : {
          current: this.result.overcasts.options.duration.value
        },
        range : {
          current: this.result.overcasts.options.range.value
        },
        other: {
          current: Object.values(this.result.overcasts.options.other)[0]?.value
        }
      }
    }
  }


  _getOvercastValue(type, spent)
  {
    // 2 SL per overcast
    return Math.ceil(spent / 2);
  }

  _getNextOvercastSpend(type, spent = 0)
  {
    // Next overcast costs current + 2
    return spent + 2;
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
