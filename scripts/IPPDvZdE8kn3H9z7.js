let test = await this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`});
await test.roll();

if (test.failed)
{
   await this.actor.addCondition("grappling")
}