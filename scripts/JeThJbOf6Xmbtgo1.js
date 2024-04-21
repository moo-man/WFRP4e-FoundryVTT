this.script.scriptMessage(await this.actor.applyBasicDamage(8 + parseInt(this.effect.sourceTest.result.SL), {suppressMsg : true}))

let test = await this.actor.setupSkill("Athletics", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
if (test.failed)
{
    this.actor.addCondition("prone")
}