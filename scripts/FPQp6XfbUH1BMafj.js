let test = await this.actor.setupSkill(game.i18n.localize("NAME.Athletics"), {fields : {difficulty : "vhard"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.failed) 
{
	this.actor.addCondition("prone");
    this.script.scriptMessage("Cannot move or act this Turn");
}