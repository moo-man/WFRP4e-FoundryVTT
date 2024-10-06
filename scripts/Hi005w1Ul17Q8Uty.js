let test = this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "average"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.succeeded)
{
	this.effect.delete()
}