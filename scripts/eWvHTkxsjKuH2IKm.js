const luck = Number(this.item.qualities.value.filter(v => v.key == "luck")[0].description)

let item = await fromUuid("Compendium.wfrp4e-core.items.Item.u0CFf3xwiyidD9T5")

for (let i = 0; i < luck; i++) {
  let data = item.toObject();
  this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
}