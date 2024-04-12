if (this.actor.type == "character")  
  this.actor.corruptionDialog("minor")

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle : " - " + this.effect.name})
await test.roll();
if(test.failed)
{
    await this.actor.addCondition("unconscious");
    let secondTest = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "easy"}, appendTitle : " - Despair"})
    await secondTest.roll();
    if(secondTest.failed)
    {
         await this.actor.addCondition("fatigued");
    }
}