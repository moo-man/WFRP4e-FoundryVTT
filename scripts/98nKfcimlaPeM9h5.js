await this.actor.addCondition("bleeding")
await this.script.message(await this.actor.applyBasicDamage(10, {suppressMsg : true}));