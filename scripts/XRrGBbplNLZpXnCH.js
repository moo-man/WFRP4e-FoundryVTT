let item;
let items = []
item = await fromUuid("Compendium.wfrp4e-core.items.rOV2s6PQBBrhpMOv")
{
    let data = item.toObject();
    items.push(data)
}
item = await fromUuid("Compendium.wfrp4e-core.items.VUJUZVN3VYhOaPjj")
{
    let data = item.toObject();
    data.system.specification.value = 2
    items.push(data)
}
item = await fromUuid("Compendium.wfrp4e-core.items.GbDyBCu8ZjDp6dkj")
{
    let data = item.toObject();
    items.push(data)
}
item = await fromUuid("Compendium.wfrp4e-core.items.a8MC97PLzl10WocT")
{
    let data = item.toObject();
    items.push(data)
}
item = await fromUuid("Compendium.wfrp4e-core.items.pLW9SVX0TVTYPiPv")
{
    let data = item.toObject();
    data.system.specification.value = 1;
    items.push(data)
}
item = await fromUuid("Compendium.wfrp4e-core.items.pTorrE0l3VybAbtn")
{
    let data = item.toObject();
    data.system.specification.value = 1;
    items.push(data)
}
item = await fromUuid("Compendium.wfrp4e-core.items.fjd1u9VAgiYzhBRp")
{
    let data = item.toObject();
    items.push(data)
}
item = await fromUuid("Compendium.wfrp4e-core.items.mDgEMOoJpi8DkRYb")
{
    let data = item.toObject();
    items.push(data)
}
item = await fromUuid("Compendium.wfrp4e-core.items.AtpAudHA4ybXVlWM")
{
    let data = item.toObject();
    data.system.specification.value = 2;
    items.push(data)
}

this.actor.createEmbeddedDocuments("Item", items, {fromEffect : this.effect.id})
