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

    this.context.ammoId = data.ammo?.id;
  }
  
  static fromData(...args)
  {
    return new this(...args);
  }

  async postTest() {
    await super.postTest()

    await this.handleAmmo();

  }

  async handleAmmo()
  {

    // Only subtract ammo on the first run, so not when edited, not when rerolled
    if (this.item.system.ammo && this.item.system.consumesAmmo.value && !this.context.ammoConsumed) 
    {
      await this.item.system.ammo.update({ "system.quantity.value": this.item.system.ammo.quantity.value - 1 })
    }
    else if (this.context.ammoId && this.item.system.consumesAmmo.value && !this.context.ammoConsumed) 
    {
      let ammo = this.actor.items.get(this.context.ammoId)
      await ammo.update({ "system.quantity.value": this.actor.items.get(this.context.ammoId).quantity.value - 1 })
    }


    if (this.item.system.loading && !this.context.ammoConsumed) 
    {
      this.item.system.loaded.amt--;
      if (this.item.system.loaded.amt <= 0) 
      {
        this.item.system.loaded.amt = 0
        this.item.system.loaded.value = false;
        await this.item.update({ "system.loaded.amt": this.item.system.loaded.amt, "system.loaded.value": this.item.system.loaded.value });

      }
      else 
      {
        await this.item.update({ "system.loaded.amt": this.item.system.loaded.amt })
      }
    }
    this.context.ammoConsumed = true;
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
