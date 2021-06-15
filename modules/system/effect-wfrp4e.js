import WFRP_Utility from "./utility-wfrp4e.js";


export default class EffectWfrp4e extends ActiveEffect {
 
  // _preCreate(data, options, user)
  // {

  // }

  get item() {
    if (effect.origin) // If effect comes from an item
    {
      let origin = effect.origin.split(".")
      let id = origin[origin.length - 1]
      return this.parent.items.get(id)
    }
  }

  /** @override */
  get sourceName()
  {
    let sourceName = this.sourceName
    if (sourceName == "Unknown")
    {
      let sourceItem = this.item
      if (sourceItem)
        sourceName = sourceItem.name;
      if (sourceItem && sourceItem.data.type == "disease" && !game.user.isGM)
        sourceName = "???";
    }
  }

  get isCondition()
  {
    return CONFIG.statusEffects.map(i => i.id).includes(this.getFlag("core", "statusId"))
  }

  get isNumberedCondition() {
    return Number.isNumeric(this.conditionValue)
  }

  get show() {
    if (game.user.isGM || !this.getFlag("wfrp4e", "hide"))
      return true
    else 
      return false
  }

  get isDisabled() {
    return this.data.disabled
  }

  // If an effect requires target -> apply, but doesn't have an item associated with it
  get isTargeted() {
    return (this.application == "apply" || this.trigger == "invoke") && !e.origin
  }


  get application() {
    return getProperty(this.data, "flags.wfrp4e.effectApplication")
  }

  get trigger() {
    return getProperty(this.data, "flags.wfrp4e.effectTrigger")
  }

  get statusId() {
    return getProperty(this.data, "flags.core.statusId")
  }

  get conditionValue() {
    return getProperty(this.data, "flags.wfrp4e.value")
  }
  

  get displayLabel() {
    if (this.data.count > 1)
      return this.label + ` (${this.data.count})`
    else return this.label
  }


}
