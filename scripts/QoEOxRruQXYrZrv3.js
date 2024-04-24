let filters = [
    {
        property : "type",
        value : "skill"
    },
    {
        property : "name",
        value : /Melee/gm,
        regex: true
    }
]

let items = await game.wfrp4e.apps.ItemDialog.createFromFilters(filters, 2, "Choose 2 Skills to add +20")
items = items.map(i => i.toObject())
items.forEach(i => i.system.advances.value = 20)

this.actor.createEmbeddedDocuments("Item", items);