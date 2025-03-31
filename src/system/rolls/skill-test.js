import WFRP_Utility from "../utility-wfrp4e.js";
import TestWFRP from "./test-wfrp4e.js"

export default class SkillTest extends TestWFRP {

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return
    this.data.preData.options.characteristicToUse = data.characteristicToUse
    this.data.preData.skillName = data.skillName
    this.computeTargetNumber();
  }

  static fromData(...args)
  {
    return new this(...args);
  }

  computeTargetNumber() {

    // If unknown skill, defer until later, once skill is found
    if (this.preData.item == "unknown" && !this.context.unknownSkill)
      return 0

    try {
      // If skill is not owned by the actor, just use characteristic
      if (this.context.unknownSkill) {
        this.result.target = this.actor.characteristics[this.context.unknownSkill.system.characteristic.value].value
      }
      else {


        // Use skill total if characteristics match, otherwise add the total up manually
        if (this.preData.options.characteristicToUse && this.preData.options.characteristicToUse != this.item.characteristic.key)
          this.result.target = this.actor.characteristics[this.preData.options.characteristicToUse].value + this.item.advances.value
        else
          this.result.target = this.item.total.value
      }
    }
    catch
    {
      this.result.target = this.item.total.value
    }

    super.computeTargetNumber();
  }

  async roll() {

    // If skill id is unknown, meaning the actor doesn't have the skill, find the skill and use characteristic
    if (this.preData.item == "unknown") {
      let skill = await WFRP_Utility.findSkill(this.preData.skillName)
      if (skill) {
        this.context.unknownSkill = skill.toObject();
        this.computeTargetNumber();
      }
      else {
        throw new Error(game.i18n.localize("ERROR.Found", { name: this.skill }))
      }
    }


    await super.roll();
  }

  get skill() {
    return this.item
  }

  get item() {
    return this.unknownSkill ? this.unknownSkill : super.item || {}
  }
}
