let test = await this.actor.setupCharacteristic("t", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "hard"}})
await test.roll();
if (test.failed)
{
    let roll = await new Roll("1d10").roll();
    roll.toMessage(this.script.getChatData())

    this.script.message(await this.actor.applyBasicDamage(roll.total, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg : true}))
}