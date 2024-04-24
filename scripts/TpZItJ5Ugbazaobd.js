let locations = [];

while (locations.length < 2)
{
    let loc = await game.wfrp4e.tables.rollTable("hitloc", {hideDSN : true})
    if (!locations.includes(loc.result))
    {
        locations.push(loc.result);
    }
}

locationText = locations.map(i => game.wfrp4e.config.locations[i]).join(", ")

this.item.updateSource({name : this.item.name += ` (${locationText})`, "flags.wfrp4e.locations" : locations})
this.effect.updateSource({"flags.wfrp4e.locations" : locations})