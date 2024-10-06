if (this.actor.type != "character")
{
    return;
}

let god = await ValueDialog.create({text : "Enter a Deity", title :  "Blessed"})

if (god)
{
    let prayers = await warhammer.utility.findAllItems("prayer", "Loading Prayers")
    let blessings = prayers.filter(p => p.system.god.value.split(",").map(i => i.trim().toLowerCase()).includes(god.toLowerCase()) && p.system.type.value == "blessing")
    let godBlessings = game.wfrp4e.config.godBlessings[god.toLowerCase()] || [];
    if (god == "Old Faith")
    {
        blessings = await ItemDialog.create(prayers.filter(i => i.system.type.value == "blessing"), 6, {text : "Select any 6 Blessings", title :  "Blessed"})
    }
    if (godBlessings.length)
    {
        blessings = blessings.concat(await Promise.all(godBlessings.filter(bls => !(blessings.map(i => i.uuid).includes(bls.uuid))).map(fromUuid)));
    }
    if (blessings.length)
    {
        this.script.notification("Adding " + blessings.map(i => i.name).join(", "))
        await this.actor.createEmbeddedDocuments("Item", blessings, {fromEffect : this.effect.id})
    }
    else 
    {
        this.script.notification(`Could not find any Blessings associated with ${god}.`)
    }
    this.item.updateSource({name : this.item.name.replace("Any", god)})
    await this.actor.update({"system.details.god.value": god})
}