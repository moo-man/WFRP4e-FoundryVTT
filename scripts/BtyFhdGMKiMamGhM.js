let test = await args.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
let damage = parseInt(this.effect.sourceTest.result.SL)

if (test.succeded)
{
   damage =  damage + 8 - parseInt(test.result.SL)
}

else 
{
   damage = damage + 10
   this.actor.addCondition("entangled", 3)
}
this.script.message(await this.actor.applyBasicDamage(damage, {loc : "roll", suppressMsg: true}))
