let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "difficult"}})
await test.roll();

if (test.failed)
{
    let sourceActor = this.effect.sourceActor;
    if (sourceActor)
    {
        this.script.message(await this.actor.applyBasicDamage(sourceActor.system.characteristics.wp.bonus, {suppressMsg : true, damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL}))
    }
}