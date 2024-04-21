let item = await fromUuid("Compendium.wfrp4e-core.items.7mCcI3q7hgWcmbBU")
let data = item.toObject();
data.system.location.key= this.item.system.location.key
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
   
let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields: {difficulty: "hard"}});
await test.roll();
if (test.failed)
{
    this.actor.addCondition("stunned")
}