let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle : ` - ${this.effect.name}`, fields : {difficulty : "difficult", slBonus : -1 * this.effect.sourceTest.result.SL}})
await test.roll();
if (test.succeeded)
{
	this.script.notification(`Resisted ${this.effect.name}`);
}
return test.failed;