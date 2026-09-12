import AttackTest5e from "./attack-test5e.js";

export default class TraitTest5e extends AttackTest5e {
  
  constructor(data)
  {
    super(data);
    if (!data) return
    if (!this.context.item)
    {
      this.context.itemData = data.trait.toObject();
    }
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }
}
