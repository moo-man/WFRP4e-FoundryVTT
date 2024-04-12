await this.actor.addCondition("prone")
let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields: {difficulty : "hard"}, appendTitle : " - " + this.effect.name})
await test.roll();
if (test.failed)
{
	await this.actor.addCondition("stunned")
}