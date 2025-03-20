if (this.actor.type != "character")
{
    return;
}

let god = await ValueDialog.create({text : "Enter a Deity", title :  "Blessed"})

if (god)
{
    let prayers = await warhammer.utility.findAllItems("prayer", "Loading Prayers", true, ["system.type.value", "system.god.value"])
    let blessings = prayers.filter(p => p.system.god.value.split(",").map(i => i.trim().toLowerCase()).includes(god.toLowerCase()) && p.system.type.value == "blessing")
    let configBlessings = await Promise.all((game.wfrp4e.config.godBlessings[god.toLowerCase()] || []).map(fromUuid));
    if (god == "Old Faith")
    {
        blessings = await ItemDialog.create(prayers.filter(i => i.system.type.value == "blessing"), 6, {text : "Select any 6 Blessings", title :  "Blessed"})
    }
    if (configBlessings.length)
    {
        // Combine blessings defined by config with actual blessing items found that specify this god, avoiding duplicates
        blessings = blessings.concat(
            configBlessings.map(i => {return {uuid : i.uuid, name : i.name}})
            .filter(bls => !(blessings.find(i => i.uuid == bls.uuid)))
        );
    }
    if (blessings.length)
    {
        this.script.notification("Adding " + blessings.map(i => i.name).join(", "))
        await this.actor.addEffectItems(blessings.map(i => i.uuid), this.effect)
    }
    else 
    {
        this.script.notification(`Could not find any Blessings associated with ${god}.`)
    }
    this.item.updateSource({name : this.item.name.replace("Any", god)})
    await this.actor.update({"system.details.god.value": god})
}