let test = await this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();

if(test.failed)
{
    let damage = this.effect.sourceItem.system.computeSpellDamage("3", true);
    this.script.message(await this.actor.applyBasicDamage(damage, {suppressMsg: true, damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP}))
}