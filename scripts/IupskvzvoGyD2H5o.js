if (this.actor.type != "character")
{
    return;
}

let god = await ValueDialog.create("Enter a Deity", "Blessed")

if (god)
{
    let prayers = await game.wfrp4e.utility.findAll("prayer", "Loading Prayers")
    let blessings = prayers.filter(p => p.system.god.value.split(",").map(i => i.trim().toLowerCase()).includes(god.toLowerCase()) && p.system.type.value == "blessing")
    if (blessings.length)
    {
        this.script.scriptNotification("Adding " + blessings.map(i => i.name).join(", "))
        await this.actor.createEmbeddedDocuments("Item", blessings, {fromEffect : this.effect.id})
    }
    else 
    {
        this.script.scriptNotification(`Could not find any Blessings associated with ${god}.`)
    }
    this.item.updateSource({name : this.item.name.replace("Any", god)})
    await this.actor.update({"system.details.god.value": god})
}