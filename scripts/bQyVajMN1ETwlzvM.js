let item = await fromUuid("Compendium.wfrp4e-core.items.aE3pyW20Orvdjzj0")
let data = item.toObject();
let target = await game.wfrp4e.tables.rollTable("fixations")
if (target)
{
    data.system.specification.value = target.result
    this.script.notification(target.result);
}
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})