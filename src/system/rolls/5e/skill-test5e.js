import CharacteristicTest5e from "./characteristic-test5e.js";

export default class SkillTest5e extends CharacteristicTest5e {
  
  constructor(data)
  {
    super(data);
    if (!data) return
    if (data.skill && data.skill.id != "unknown")
    {
      this.context.skill = data?.skill?.toObject();
    }
    else 
    {
      this.context.skill == data.skill;
    }
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }

  get skill()
  {
    return new CONFIG.Item.documentClass(this.context.skill, { parent: this.actor })
  }
}
