import CharacteristicTest5e from "./characteristic-test5e.js";

export default class SkillTest5e extends CharacteristicTest5e {
  
  constructor(data)
  {
    super(data);
    this.context.skill = data?.skill.toObject();
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
