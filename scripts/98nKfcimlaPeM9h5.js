await this.actor.addCondition("bleeding")
await this.script.scriptMessage(await this.actor.applyBasicDamage(10, {suppressMsg : true}));