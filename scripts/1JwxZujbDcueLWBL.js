await this.actor.addCondition("ablaze", 2)
await this.script.scriptMessage(await this.actor.applyBasicDamage(this.effect.sourceTest.result.damage, {suppressMsg: true}))