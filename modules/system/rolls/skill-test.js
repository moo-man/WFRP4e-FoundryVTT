import TestWFRP from "./test-wfrp4e.js"

export default class SkillTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return
    this.data.preData.options.characteristicToUse = data.characteristicToUse
    this.computeTargetNumber();
  }

  computeTargetNumber() {

    try {
      // Use skill total if characteristics match, otherwise add the total up manually
      if (this.preData.options.characteristicToUse && this.preData.options.characteristicToUse != this.item.characteristic.key)
        this.result.target = this.actor.characteristics[this.preData.options.characteristicToUse].value + this.item.advances.value
      else
        this.result.target = this.item.total.value
    }
    catch
    {
      this.result.target = this.item.total.value
    }

    super.computeTargetNumber();
  }
  get skill() {
    return this.item
  }

  get characteristicKey() {
    if (this.preData.options.characteristicToUse)
      return this.preData.options.characteristicToUse
    else
      return this.item.characteristic.key
  }
}
