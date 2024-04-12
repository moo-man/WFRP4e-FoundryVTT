let test = await this.actor.setupCharacteristic("ag", {appendTitle : ` - ${this.effect.name}`});
await test.roll();
if (test.failed)
{
   this.actor.addCondition("bleeding");
}
