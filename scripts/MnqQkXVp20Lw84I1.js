let test = await this.actor.setupCharacteristic("t", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "difficult"}})
await test.roll();
if (test.failed)
{
    this.script.scriptMessage(await this.actor.applyBasicDamage(3, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}))
}