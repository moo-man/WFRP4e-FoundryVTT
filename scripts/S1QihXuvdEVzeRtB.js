let dice = await new Roll("1d10").roll()
let roll = dice.total
let talent 
let message
let modifier = 0

if (roll <= 3)
{
    item = await fromUuid("Compendium.wfrp4e-core.items.mNoCuaVbFBflfO6X")
}

else if (roll <= 6)
{
    item = await fromUuid("Compendium.wfrp4e-core.items.OEjUvJKi0xmBwbS2")
    modifier = -3
}

else if (roll <= 9)
{
    item = await fromUuid("Compendium.wfrp4e-core.items.mdPGZsn2396dEpOf")
    modifier = -3
}

else if (roll = 10)
{
    item = await fromUuid("Compendium.wfrp4e-core.items.qdMbxW09FUoYBzmB")
    modifier = -5
}

message = `${roll} Rolled, gain ${item.name}, ${modifier} Strength`
dice.toMessage(this.script.getChatData())

let changes = foundry.utils.duplicate(this.effect.changes)
changes[0].value = modifier

this.effect.updateSource({changes})

await this.actor.createEmbeddedDocuments("Item", [item.toObject()], {fromEffect : this.effect.id})

this.script.notification(message)