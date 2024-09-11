let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "hard"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.failed) 
{
	this.script.scriptMessage(await this.actor.applyBasicDamage(15, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg: true}))
}