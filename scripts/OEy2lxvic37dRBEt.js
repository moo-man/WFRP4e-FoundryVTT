let filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "system.lore.value",
        value : "petty"
    }
]

let petty = await game.wfrp4e.apps.ItemDialog.createFromFilters(filters, 3, "Choose 3 Petty Spells")


filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "system.lore.value",
        value : ""
    }
]

let arcane = await game.wfrp4e.apps.ItemDialog.createFromFilters(filters, 3, "Choose 3 Arcane Spells")

let items = petty.concat(arcane).map(i => i.toObject())

this.actor.createEmbeddedDocuments("Item", items);