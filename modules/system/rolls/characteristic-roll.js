import RollWFRP from "./roll-wfrp4e.js"

export default class CharacteristicRoll extends RollWFRP
{
  constructor(...args)
  {
    super(...args)
    this.computeTargetNumber();
  }

  computeTargetNumber() {
    this.data.preData.target = this.item.value
    super.computeTargetNumber();
  }

  get item() {
    return this.actor.characteristics[this.data.preData.itemId]
  }
}
