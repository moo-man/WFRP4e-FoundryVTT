this.actor.addCondition("entangled")
let msg = `<b>${this.actor.prototypeToken.name}</b> loses 1 Wound and gains 1 <strong>Entangled</strong> Condition.`
this.script.message(msg)
this.actor.modifyWounds(-1)