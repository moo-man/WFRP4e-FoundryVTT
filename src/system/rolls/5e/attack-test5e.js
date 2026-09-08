import SkillTest5e from "./skill-test5e.js";

export default class AttackTest5e extends SkillTest5e {
  
  constructor(data)
  {
    super(data);
    if (!data) return
    this.testData.combatCriticals = true;
    this.testData.damage = data.damage;
  }

  async computeResult()
  {
    await super.computeResult();
    await this.computeDamage()
  }

  async computeDamage()
  {
    this.result.damage = this.testData.damage + this.result.SL;
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }
}
