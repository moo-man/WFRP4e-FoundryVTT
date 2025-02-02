let choice = await Dialog.wait({
    title : "Option",
    content : 
    `<p>
    Add Option?
    </p>
    <ol>
    <li>Ranged (Bow) +10 and a Longbow with 12 Arrows</li>
    </ol> 
    `,
    buttons : {
        1 : {
            label : "Yes",
            callback : () => {
                return [
                    {
                        type : "skill",
                        name : "Ranged (Bow)",
                        diff : {
                            system : {
                                advances : {
                                    value : 10
                                }
                            }
                        }
                    },
                    {
                        type : "weapon",
                        name : "Longbow",
                    },
                    {
                        type : "ammunition",
                        name : "Arrow",
                    }
                ];
            }
        },
        2 : {
            label : "No",
            callback : () => {
                return [];
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
