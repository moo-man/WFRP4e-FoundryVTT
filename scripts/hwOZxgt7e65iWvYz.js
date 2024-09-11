let test = await this.actor.setupCharacteristic("t", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
if (test.failed)
{
    let damage = this.effect.sourceTest.result.damage

    this.script.message(await this.actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true}))
}