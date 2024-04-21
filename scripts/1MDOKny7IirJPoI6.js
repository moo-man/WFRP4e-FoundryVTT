let test = await this.actor.setupCharacteristic("wp", {skipTargets: true, appendTitle :  ` ${this.effect.name}`})
await test.roll()
if (test.succeeded)
{
    this.effect.delete();
}
