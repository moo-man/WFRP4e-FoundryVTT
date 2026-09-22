import WFRP_Utility from "../../utility-wfrp4e.js";
import AttackTest5e from "./attack-test5e.js";

export default class WeaponTest5e extends AttackTest5e {
  
  constructor(data)
  {
    super(data);
    if (!data) return
    this.context.vehicle = data.vehicle;
    if (!this.context.item)
    {
      this.context.itemData = data.weapon.toObject();
    }
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }

  get vehicle() {
    if (this.context.vehicle)
      return WFRP_Utility.getSpeaker(this.context.vehicle);
  }

  get item() 
  {
    let actor = this.vehicle || this.actor;
    if (this.context.itemData)
      return new CONFIG.Item.documentClass(this.context.itemData, { parent: actor });
    else
      return actor.items.get(this.context.item);
  }
}
