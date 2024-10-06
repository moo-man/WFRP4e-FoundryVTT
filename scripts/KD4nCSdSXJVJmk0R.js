this.script.message(await this.actor.applyBasicDamage(this.effect.sourceTest.result.damage, {suppressMsg : true}))
await this.actor.addCondition("ablaze")