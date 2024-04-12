let item = this.effect.getCreatedItems()?.[0];
ChatMessage.create({content : "<em>Grace is beyond style</em>", speaker : ChatMessage.getSpeaker({token: this.actor.getActiveTokens()[0]?.document, actor: this.actor})}, {chatBubble : true})

let choice = await ItemDialog.create(ItemDialog.objectToArray({
    "nobles" : "Nobles",
    "guilders" : "Guilders",
    "servants" : "Servants"
}), 1, "Choose Group")

let name = choice[0]?.name

if (!name)
{
    return;
}

if (item)
{
    item.update({
        name : item.name.split("(")[0] + ` (${name})`, 
        "system.tests.value" : item.system.tests.value.split("(")[0] + ` (${name}`
    })
}
else 
{
    item = await fromUuid("Compendium.wfrp4e-core.items.Item.sYbgpSnRqSZWgwFP");
    let data = item.toObject();
    data.name += ` (${name})`
    this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})
}