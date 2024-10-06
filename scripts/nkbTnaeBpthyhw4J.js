let fortunePoints = this.effect.sourceTest.result.overcast.usage.other.current
let current = this.actor.status.fortune.value

this.actor.update({"system.status.fortune.value" : fortunePoints + current})

this.script.message(`<b>${this.actor.prototypeToken.name}</b> fortune points increased from ${current} to ${fortunePoints + current}`)