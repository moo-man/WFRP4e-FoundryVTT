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
    let damage = {base: {label: "Base", value: this.testData.damage}, SL: {label: "SL", value: this.result.SL}};
    await this.runScripts("computeDamage", {damage})
    this.result.damage = Object.values(damage).reduce((total, damage ) => total + damage.value, 0);
    this.result.damageBreakdown = damage;
  }

  formatBreakdown()
  {
    try {

      let breakdown = super.formatBreakdown();

      let damageBreakdown = "";

      damageBreakdown += `<p><strong>${this.result.damageBreakdown.base.label}</strong>: ${this.result.damageBreakdown.base.value}</p>`;

      Object.keys(this.result.damageBreakdown).filter(i => i != "base").forEach(i => {
        damageBreakdown += `<p><strong>${this.result.damageBreakdown[i].label}</strong>: ${this.result.damageBreakdown[i].value}</p>`;
      });

      breakdown.damage = damageBreakdown;

      return breakdown;
    }
    catch(e)
    {
      console.error(`Error generating formatted breakdown: ${e}`, this);
    }
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }
}
