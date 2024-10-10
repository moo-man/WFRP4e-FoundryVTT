let choice1 = [
    {
        type : "armour",
        name : "Mail Chausses"
    },
    {
        type : "armour",
        name : "Mail Coat"
    },
    {
        type : "armour",
        name : "Mail Coif"
    },
]
let choice2 = [
    {
        type : "armour",
        name : "Mail Chausses"
    },
    {
        type : "armour",
        name : "Mail Coat"
    },
    {
        type : "armour",
        name : "Mail Coif"
    },
    {
        type : "armour",
        name : "Leather Leggings"
    },
    {
        type : "armour",
        name : "Leather Skullcap"
    },
    {
        type : "armour",
        name : "Leather Jack"
    },
]
let choice3 = [
    {
        type : "armour",
        name : "Plate Breastplate"
    },
    {
        type : "armour",
        name : "Plate Bracers"
    },
    {
        type : "armour",
        name : "Plate Helm"
    },
    {
        type : "armour",
        name : "Plate Leggings"
    },
]

let choice = await new Promise((resolve, reject) => {
    new Dialog({
        title : "Choice",
        content : 
        `<p>
        Select your choice
        </p>
        <ol>
        <li>Mail</li>
        <li>Mail & Leather</li>
        <li>Plate</li>
        </ol> 
        `,
        buttons : {
            1 : {
                label : "Mail",
                callback : () => {
                    resolve(choice1)
                }
            },
            2 : {
                label : "Mail & Leather",
                callback : () => {
                    resolve(choice2)
                }
            },
            3 : {
                label : "Plate",
                callback : () => {
                    resolve(choice3)
                }
            }
        }
    }).render(true)
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
            ui.notifications.warn(`Could not find ${c.name}`, {permanent : true})
    }

}
await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);
