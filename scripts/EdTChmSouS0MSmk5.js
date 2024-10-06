let test = await this.actor.setupCharacteristic("wp", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
if (test.succeeded)
{
    this.script.message("Can perform an Action or Move (choose one)")
}
else 
{
    this.script.message("Cannot perform an Action or Move this round")    
}