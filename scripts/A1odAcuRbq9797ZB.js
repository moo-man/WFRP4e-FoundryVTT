let choice1 = [
    {
        type : "skill",
        name : "Melee (Basic)",
        diff : {
            system : {
                advances : {
                    value : 10
                }
            }
        }
    }
]
let choice2 = [
    {
        type : "skill",
        name : "Melee (Polearm)",
        diff : {
            system : {
                advances : {
                    value : 10
                }
            }
        }
    }
]

let choice = await Dialog.wait({
    title : "Choice",
    content : 
    `<p>
    Select your choice
    </p>
    <ol>
    <li>Melee (Basic)</li>
    <li>Melee (Polearm)</li>
    </ol> 
    `,
    buttons : {
        1 : {
            label : "Basic",
            callback : () => {
                return choice1;
            }
        },
        2 : {
            label : "Polearm",
            callback : () => {
                return choice2;
            }
        }
    }
})

let updateObj = this.actor.toObject();
let items = []
for (let c of choice)
{
    let existing 
    if (c.type == "skill")
    {
        existing = updateObj.items.find(i => i.name == c.name && i.type == c.type)
        if (existing && c.diff?.system?.advances?.value)
        {
            existing.system.advances.value += c.diff.system.advances.value
        }
    }

    if (!existing)
    {
        let item = await game.wfrp4e.utility.find(c.name, c.type)
        if (item)
        {
            let equip = item.system.tags.has("equippable");
            item = item.toObject()
            if (equip)
            {
                item.system.equipped.value = true;
            }
            items.push(foundry.utils.mergeObject(item, (c.diff || {})))
        }
        else
            ui.notifications.warn(`Could not find ${talent}`, {permanent : true})
    }

}
await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);
