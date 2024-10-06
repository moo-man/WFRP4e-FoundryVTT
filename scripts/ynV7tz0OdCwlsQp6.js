let msg = ""
msg += `<p>${await this.actor.applyBasicDamage(8, {loc : "roll", suppressMsg: true, hideDSN: true})}</p>`
msg += `<p>${await this.actor.applyBasicDamage(8, {loc : "roll", suppressMsg: true, hideDSN: true})}</p>`
msg += `<p>${await this.actor.applyBasicDamage(8, {loc : "roll", suppressMsg: true, hideDSN: true})}</p>`

this.script.message(msg);