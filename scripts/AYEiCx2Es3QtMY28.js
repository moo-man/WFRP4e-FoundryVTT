let choice1 = [
    {
        type: "trait",
        name: "Bestial",
    },
    {
        type: "trait",
        name: "Regeneration",
    },
    {
        type: "trait",
        name: "Size (Large)",
    },
    {
        type: "trait",
        name: "Territorial",
    }
]

let updateObj;
let actor;

async function addTrait(c) {
    let items = [];
    let existing;
    if (c.type == "trait") {
        existing = updateObj.items.find(i => i.name == c.name && i.type == c.type);
    }
    if (!existing) {
        let item = await game.wfrp4e.utility.find(c.name, c.type);
        if (item) {
            item = item.toObject();
            items.push(item);
        }
        else
            ui.notifications.warn(`Could not find ${c}`, { permanent: true });
    }
    console.log("WISH LIST2", choice1, items);
    actor.createEmbeddedDocuments("Item", items);
}

async function dialogChoice() {
    for (let c of choice1) 
    {
        if (await foundry.applications.api.DialogV2.confirm({window : {title: "Option"}, content:`<p>Add Option?</p><ol><li>${c.name}</li></ol>`}))
        {
            addTrait(c)
            c.valid = true;
        }
    }
}

updateObj = this.actor.toObject();
actor = this.actor
await dialogChoice();

