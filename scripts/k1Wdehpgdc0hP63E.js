let item = await fromUuid("Compendium.wfrp4e-core.items.Item.aE3pyW20Orvdjzj0")
let hatred = item.toObject();
hatred.system.specification.value = "Skaven"

item = await fromUuid("Compendium.wfrp4e-core.items.Item.3wCtgMDNnu8MFmyk")
let immunity = item.toObject();
immunity.system.specification.value = "Poison"

item = await fromUuid("Compendium.wfrp4e-core.items.Item.oRx92ByVNEBN6YkK")
let berserk = item.toObject();
await this.actor.createEmbeddedDocuments("Item", [hatred, immunity, berserk], {fromEffect : this.effect.id})