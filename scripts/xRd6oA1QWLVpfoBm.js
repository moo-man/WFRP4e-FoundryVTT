if (!this.actor.has("Night Vision"))
{
    let item = await fromUuid("Compendium.wfrp4e-core.items.FmHDbCOy3pH8yKhm");
    let data = item.toObject();
    this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
}