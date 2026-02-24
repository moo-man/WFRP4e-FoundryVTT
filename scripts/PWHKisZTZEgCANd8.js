let test = await this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.failed)
{
	let sourceActor = this.effect.sourceActor;
	this.script.message(await this.actor.applyBasicDamage(4 + sourceActor.system.characteristics.s.bonus, {suppressMsg : true}))
}