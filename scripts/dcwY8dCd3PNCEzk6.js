let current = this.actor.status.fate.value

this.actor.update({"system.status.fate.value" : current + 1})

this.script.message(`<b>${this.actor.prototypeToken.name}</b> fate points increased from ${current} to ${current + 1}`)