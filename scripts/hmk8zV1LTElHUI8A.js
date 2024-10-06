let msg = `<b>${this.actor.prototypeToken.name}</b> loses 1 Wound.<br>`
  if (this.actor.status.wounds.value <= 1)
  {
    msg += `<b>${this.actor.prototypeToken.name}</b> goes unconscious.<br>`
    await this.actor.addCondition("unconscious")
  }
  this.script.message(msg)
  this.actor.modifyWounds(-1)