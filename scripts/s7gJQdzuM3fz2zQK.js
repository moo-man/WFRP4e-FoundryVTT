let item = await fromUuid("Compendium.wfrp4e-core.items.QluSTTTq3viHJJUh")
let data = item.toObject();
data.system.location.value = "Hip"
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
   
let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
if (test.failed)
{
    this.actor.addCondition("prone")
}