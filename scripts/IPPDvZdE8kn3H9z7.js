let test = await this.actor.setupSkill("Dodge", {appendTitle : ` - ${this.effect.name}`});
await test.roll();

if (test.failed)
{
   await this.actor.addCondition("grappling")
}