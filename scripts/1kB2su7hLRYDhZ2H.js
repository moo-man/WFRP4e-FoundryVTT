let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  " - " + this.effect.name})
await test.roll();
if (!test.succeeded)
{
    let item = await fromUuid("Compendium.wfrp4e-core.items.ZhMADOqoo0y8Q9bx")
    let data = item.toObject();
    if (this.item.system.location.key == "rLeg")
    {
        data.system.location.value = "Right Toe"
	data.system.location.key = "rToe";
    }
    else if (this.item.system.location.key == "lLeg")
    {
        data.system.location.value = "Left Toe"
	data.system.location.key = "lToe";
    }
    this.actor.createEmbeddedDocuments("Item", [data])
}
this.effect.delete();