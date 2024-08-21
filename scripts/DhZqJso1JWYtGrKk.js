this.actor.addCondition("ablaze")
let damage = this.effect.sourceTest.result.damage + this.effect.sourceTest.result.additionalDamage
this.script.message(await this.actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}))