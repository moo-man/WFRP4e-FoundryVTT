import SkillTest5e from "./skill-test5e";

export default class CastTest5e extends SkillTest5e {
  
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
    this.computeDispel();
    await super.computeResult();
    await this.computeSpellResult()
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

  async computeDispel()
  {
    if (this.testData.dispel)
    {
      this.result.dispel = foundry.utils.deepClone(this.testData.dispel);
      this.result.dispel.SL *= -1; // Positive dispel SL should show as negative and vice versa
      this.result.SLModifier += this.result.dispel.SL;
    }
  }

  _handleCastSuccess()
  {
    this.result.description = game.i18n.localize("ROLL.CastingSuccess");
    if (this.result.critical)
    {
      this.result.miscast = "minor";
      this.result.criticalCast = this.testData.criticalCastChoice;
    }
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
        label : this.result.minormis,
        class : "fumble-roll",
        key : "minormis"
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
