import TestWFRP from "./test-wfrp4e.js"

export default class CharacteristicTest extends TestWFRP {
  constructor(...args) {
    super(...args)
    if (!args.data)
      return
    this.computeTargetNumber();
  }

  computeTargetNumber() {
    this.data.preData.target = this.item.value
    super.computeTargetNumber();
  }

  get item() {
    return this.actor.characteristics[this.data.preData.itemId]
  }
  get characteristic() {
    return this.item
  }
}
