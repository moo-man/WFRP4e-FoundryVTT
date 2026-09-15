import OvercastableTest5e from "./overcast-test5e";

export default class CastTest5e extends OvercastableTest5e {
  
  constructor(data)
  {
    super(data);
    if (!data) return
    this.testData.combatCriticals = true;
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }

    
  initializeResult()
  {
    super.initializeResult();
    this.result.miscastModifier = 0;
  }

  async computeResult()
  {
    this.initializeOvercasts()
    this.computeDispel();
    await super.computeResult();
    await this.computeSpellResult()
    this.computeOvercasts();
  }

  async computeSpellResult()
  {
    this.result.CN = this.spell.system.cn.value;

    this.result.excessSL = this.result.SL - this.result.CN;
    this.result.castSuccess = this.result.SL >= this.spell.system.cn.value;
    this.result.miscast = null;
    if (this.result.castSuccess)
    {
      this._handleCastSuccess();
    }
    else 
    {
      this._handleCastFailure();
    }
  }

  async computeDamage()
  {
    this.result.damage = this.result.overcasts.options.damage.initial;
  }

  async computeDispel()
  {
    if (this.testData.dispel)
    {
      this.result.dispel = foundry.utils.deepClone(this.testData.dispel);
      this.result.dispel.SL *= -1; // Positive dispel SL should show as negative and vice versa
      this.result.SLModifier += this.result.dispel.SL;
    }
  }

  _computeOvercastAmount()
  {
    let isPetty = this.item.system.lore.value.includes("petty");
    this.result.overcasts.allowed = !isPetty;
    this.result.overcasts.total = this.result.excessSL;
    if (this.result.criticalCastChoice == "totalPower") // Add tens digit to overcasting available
    {
      this.result.overcasts.total += Math.trunc(this.result.roll / 10);
    }
    this.result.overcasts.total = Math.min(this.result.overcasts.total, this.actor.system.characteristics.wp.bonus + this.actor.system.characteristics.int.bonus) // Can't spent more than IntB + WPB
    let totalSpent = Object.values(this.testData.overcastSpending).reduce((a, b) => a + b, 0);
    this.result.overcasts.available = this.result.overcasts.total - totalSpent;
  }

  _handleCastSuccess()
  {
    this.result.description = game.i18n.localize("ROLL.CastingSuccess");
    if (this.result.critical)
    {
      this.result.miscast = "minor";
      this.result.criticalCast = this.testData.criticalCastChoice;
    }
    this.computeDamage();
  }

  _handleCastFailure()
  {
    this.result.description = game.i18n.localize("ROLL.CastingFailed")
    if (this.result.fumble)
    {
      this.result.miscast = "minor";
    }
  }

  
  computeTables()
  {
    super.computeTables();
    delete this.result.tables.critical;
    delete this.result.tables.fumble;

    if (this.result.critical && this.result.criticalCast == "criticalDamage")
    {
      this.result.tables.critical = {
        label : "Critical",
        class : "critical-roll",
        modifier : this.result.critModifier || 0,
        key: `crit${this.result.hitloc.result}`
      }
    }

    if (this.result.miscast == "minor")
    {
      this.result.tables.miscast = {
        label : game.i18n.localize("ROLL.MinorMis"),
        class : "fumble-roll",
        key : "minormis"
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


  dispel(dispelTest)
  {
    this.testData.dispel = dispelTest.result;
    this.context.dispelTest = dispelTest.message.id;
    this.roll();
  }

  get damageEffects() 
  {
      return [];
  }

  get targetEffects() 
  {
      return [];
  }

  get areaEffects() 
  {
      return [];
  }

  get hasIngredient() {
    return this.item.ingredient && this.item.ingredient.quantity.value > 0
  }

  get spell() {
    return this.item
  }

}
