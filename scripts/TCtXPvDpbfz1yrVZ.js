let choice1 = [
    {
        type : "skill",
        name : "Melee (Basic)",
        diff : {
            system : {
                advances : {
                    value : 20
                }
            }
        }
    }
]
let choice2 = [
    {
        type : "skill",
        name : "Melee (Two-Handed)",
        diff : {
            system : {
                advances : {
                    value : 20
                }
            }
        }
    }
]

let choice = await new Promise((resolve, reject) => {
    new Dialog({
        title : "Choice",
        content : 
        `<p>
        Select your choice
        </p>
        <ol>
        <li>Melee (Basic)</li>
        <li>Melee (Two-Handed)</li>
        </ol> 
        `,
        buttons : {
            1 : {
                label : "Basic",
                callback : () => {
                    resolve(choice1)
                }
            },
            2 : {
                label : "Two-Handed",
                callback : () => {
                    resolve(choice2)
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
            item = item.toObject()
            items.push(foundry.utils.mergeObject(item, (c.diff || {})))
        }
        else
            ui.notifications.warn(`Could not find ${talent}`, {permanent : true})
    }

}
await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);
