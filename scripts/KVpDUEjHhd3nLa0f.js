let test = await this.actor.setupCharacteristic("wp", {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
if (test.failed)
{
    this.script.message(await game.wfrp4e.tables.formatChatRoll("enrage-beast"))
}