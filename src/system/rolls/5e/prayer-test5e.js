import SkillTest5e from "./skill-test5e";

export default class PrayerTest5e extends SkillTest5e {
  
  constructor(data)
  {
    super(data);
    if (!data) return
    this.testData.sin = this.actor.system.status.sin.value;
    this.testData.combatCriticals = true;
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }

    
  initializeResult()
  {
    super.initializeResult();
    this.result.wrathModifier = this.testData.sin *= 10;
  }

  async computeResult()
  {
    await super.computeResult();
    await this.computePrayerResult()
  }

  async computePrayerResult()
  {
    if (this.result.success)
    {
      this.result.description = game.i18n.localize("ROLL.PrayGranted")
    }
    else 
    {
      this.result.description = game.i18n.localize("ROLL.PrayRefused")
    }
  }


  computeTables()
  {
    super.computeTables();
    delete this.result.tables.critical;
    delete this.result.tables.fumble;

    let unitResult = Number(this.result.roll.toString().split('').pop())
    if (unitResult == 0)
      unitResult = 10;


    if (this.result.fumble || unitResult <= this.testData.sin)
    {
      this.result.tables.wrath = {
        label : game.i18n.localize("ROLL.Wrath"),
        class : "fumble-roll",
        key : "wrath",
        modifier: this.result.wrathModifier
      }
    }
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

  get prayer() {
    return this.item
  }

}
