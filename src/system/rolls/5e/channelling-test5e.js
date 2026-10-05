import SkillTest5e from "./skill-test5e";

export default class ChannellingTest5e extends SkillTest5e {
  
  constructor(data)
  {
    super(data);
    if (!data) return
    this.context.wind = data.context.wind;
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }

  async computeResult()
  {
    await super.computeResult();
    await this.computeChannellingResult()
  }

  initializeResult()
  {
    super.initializeResult();
    this.result.miscastModifier = 0;
  }

  async computeChannellingResult()
  {
    this.result.SLAdded = 0;
    this.result.miscast = null;
    if (this.result.success)
    {
      this.result.SLAdded = this.result.SL - (this.testData.previousSLAdded || 0);
      if (this.result.critical)
      {
        this.result.SLAdded += this.actor.system.characteristics.wp.bonus;
      }
    }
    else 
    {
      if (this.result.fumble)
      {
        let roll = await new Roll("1d10").roll();
        roll.toMessage({speaker: this.context.speaker, flavor: "Channelled Power Lost"})
        this.result.SLAdded -= roll.total;
        this.result.miscastModifier = 10 * roll.total;
        this.result.miscast = "minor";
      }
    }
  }

  async postTest()
  {
    await super.postTest();
    this.testData.previousSLAdded = this.result.SLAdded; // If test is edited
    this.actor.update(this.actor.system.status.channelling.set({wind: this.context.wind, value: this.result.SLAdded, add: true}));
  }

  computeTables()
  {
    super.computeTables();
    delete this.result.tables.critical;
    delete this.result.tables.fumble;

    if (this.result.miscast == "minor")
    {
      this.result.tables.miscast = {
        label : this.result.minormis,
        class : "fumble-roll",
        key : "minormis",
        modifier: this.result.miscastModifier
      };
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

}
