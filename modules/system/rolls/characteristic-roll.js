import RollWFRP from "./roll-wfrp4e.js"

export default class CharacteristicRoll extends RollWFRP
{

  computeTargetNumber() {
    this.data.preData.target = this.item.value
    super.computeTargetNumber();
  }

  get item() {
    return this.actor.characteristics[this.data.preData.itemId]
  }
}
