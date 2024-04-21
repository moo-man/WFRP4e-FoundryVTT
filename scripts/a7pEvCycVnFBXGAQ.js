let test = await this.actor.setupCharacteristic("i", {skipTargets: true, appendTitle :  " - Stunned", fields : {difficulty : "easy"}})
await test.roll();

if (!test.succeeded)
{
	this.actor.addCondition("stunned");
}