let item = await fromUuid("Compendium.wfrp4e-core.items.aE3pyW20Orvdjzj0")
let data = item.toObject();
data.system.specification.value = "Religion"
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})