let specification = this.item.system.specification.value;
let choice = [];

if (!specification || specification == "Trained Skills")
{
    choice = await ItemDialog.create(ItemDialog.objectToArray({
        broken: "Broken",
        drive: "Drive",
        entertain: "Entertain",
        fetch: "Fetch",
        guard: "Guard",
        home: "Home",
        magic: "Magic",
        mount: "Mount",
        war: "War"
    }, this.effect.img), "unlimited", "Choose Training");
}
else 
{
    choice = specification.split(", ").map(i => {
        return {
            id : i.toLowerCase(),
            name : i
        }
    });
}

if (choice.length)
{
    let changes = foundry.utils.deepClone(this.effect.changes);

    for(let training of choice)
    {
        switch(training.id)
        {
            case "broken" : 
                let roll = await new Roll("2d10").roll({allowInteractive : false});   
                roll.toMessage(this.script.getChatData());
                changes.push({value : roll.total, mode : 2, key : "system.characteristics.fel.modifier"})

                if (this.actor.type == "creature")
                {
                    let bestial = this.actor.itemTypes.trait.find(i => i.name == "Bestial");
                    if (bestial)
                    {
                        bestial.update({"system.disabled" : true})
                    }
                }
                break;

            case "drive" : 

                break;

            case "entertain" : 

                break;

            case "fetch" : 

                break;

            case "guard" : 
                let territorial = await fromUuid("Compendium.wfrp4e-core.items.Item.JIAe7i7dqTQBu4do");
                await this.actor.createEmbeddedDocuments("Item", [territorial], {fromEffect: this.effect.id})
                foundry.utils.setProperty(args, "options.keepId", true);
                break;

            case "home" : 

                break;

            case "magic" : 

                break;

            case "mount" : 

                break;

            case "war" : 
                changes.push({value : 10, mode : 2, key : "system.characteristics.ws.modifier"})
                break;
        }
    }
    this.effect.updateSource({name : `${this.effect.name} (${choice.map(i => i.name).join(", ")})`, changes, "flags.wfrp4e.trained" : choice.map(i => i.id)})
    this.item.updateSource({"system.specification.value" : `${choice.map(i => i.name).join(", ")}`})
}