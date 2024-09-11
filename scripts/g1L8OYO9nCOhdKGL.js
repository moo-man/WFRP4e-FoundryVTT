// Everything within Fellowship Bonus yards 
// of the target point is splashed with mystic poison, 
// suffering 1d10 + SL damage which ignores Armour Points

let damage = (await new Roll(`1d10 + ${parseInt(this.effect.sourceTest.result.SL)}`).roll())

await damage.toMessage(this.script.getChatData())

this.script.message(await args.actor.applyBasicDamage(
  damage.total,
  {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg: true}
))

// ... and gains the Poisoned Condition

this.actor.addCondition("poisoned")