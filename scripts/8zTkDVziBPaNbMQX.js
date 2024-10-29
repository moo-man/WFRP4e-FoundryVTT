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

let petty = await ItemDialog.createFromFilters(filters, 6, {text : "Choose 6 Petty Spells"})


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

let arcane = await ItemDialog.createFromFilters(filters, 9, {text : "Choose 9 Arcane Spells"})

let items = petty.concat(arcane).map(i => i.toObject())

this.actor.createEmbeddedDocuments("Item", items);