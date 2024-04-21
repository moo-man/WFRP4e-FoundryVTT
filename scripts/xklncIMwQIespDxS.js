let test = await this.actor.setupCharacteristic("t", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "vhard"}});
await test.roll();
game.wfrp4e.utility.postCorruptionTest("minor", this.script.getChatData())

if (test.failed)
{
    this.actor.addCondition("unconscious");
}