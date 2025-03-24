this.actor.addCondition("fatigued", parseInt(this.effect.sourceTest.result.SL))

let test = await this.actor.setupSkill("Cool", {fields : {difficulty: "challenging"}, appendTitle : ` - ${this.effect.name}`});

await test.roll();

if (test.failed)
{
	this.actor.addCondition("broken");
}