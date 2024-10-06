this.script.message(await game.wfrp4e.tables.formatChatRoll("fleshy-curse"))

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "hard"}})
await test.roll();
if (test.succeeded)
{
    this.effect.delete()
}