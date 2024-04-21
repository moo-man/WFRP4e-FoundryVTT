let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields: {difficulty: "difficult"}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();

if (test.failed)
{
    this.actor.addCondition("stunned")
}


let item = await fromUuid("Compendium.wfrp4e-core.items.4lj1ik958mbgAlaF")
let data = item.toObject();
data.system.location.key = this.item.system.location.key
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
