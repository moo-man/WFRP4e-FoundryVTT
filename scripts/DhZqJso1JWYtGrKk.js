this.actor.addCondition("ablaze")
let roll = await new Roll(`1d10 + ${parseInt(this.effect.sourceTest.result.SL)}`).roll();
game.dice3d?.showForRoll(roll);
this.script.scriptMessage(await this.actor.applyBasicDamage(roll.total, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}))