let test = await this.actor.setupCharacteristic("ag", {fields : {difficulty : "hard"}});
await test.roll();

if (test.failed)
{
   await this.actor.addCondition("bleeding")
   await this.actor.addCondition("entangled")
}