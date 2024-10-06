let healed = parseInt(this.effect.sourceTest.result.SL)
this.actor.modifyWounds(healed)
this.script.message(`Healed ${healed} Wounds`)