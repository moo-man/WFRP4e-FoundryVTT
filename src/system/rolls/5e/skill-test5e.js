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

    this.context.dispel = data.context.dispel;
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }

  handleDispel()
  {
    let dispelTarget = game.messages.get(this.context.dispel)
    if (dispelTarget)
    {
      if (game.user.id == getActiveDocumentOwner(dispelTarget)?.id)
      {
        dispelTarget.system.test.dispel(this);
      }
    }
  }

  get skill()
  {
    return new CONFIG.Item.documentClass(this.context.skill, { parent: this.actor })
  }
}
