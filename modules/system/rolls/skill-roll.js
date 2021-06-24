import RollWFRP from "./roll-wfrp4e.js"

export default class SkillRoll extends RollWFRP
{

  constructor(data, actor)
  {
    super(data, actor)
    this.data.preData.options.characteristicToUse = data.characteristicToUse
    this.computeTargetNumber();
  }

  computeTargetNumber() {

    // Use skill total if characteristics match, otherwise add the total up manually
    if (this.preData.options.characteristicToUse && this.preData.options.characteristicToUse != this.item.characteristic.key)
      this.preData.target = this.actor.characteristics[this.preData.options.characteristicToUse].value + this.item.advances.value
    else 
      this.preData.target = this.item.total.value
      
    super.computeTargetNumber();
  }
}
