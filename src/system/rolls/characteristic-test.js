import TestWFRP from "./test-wfrp4e.js"

export default class CharacteristicTest extends TestWFRP {
  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    if (this.actor.type == "vehicle")
      this.data.preData.item = "t";
      
    this.computeTargetNumber();
  }

  static fromData(...args)
  {
    return new this(...args);
  }

  computeTargetNumber() {
    this.data.result.target = this.item.value
    super.computeTargetNumber();
  }

  get item() {
    return this.actor.characteristics[this.data.preData.item]
  }
  get characteristic() {
    return this.item
  }
}
