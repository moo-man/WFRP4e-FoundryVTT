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

let petty = (await ItemDialog.createFromFilters(filters, 4, "Choose 4 Petty Spells")).map(i => i.toObject());


filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "system.lore.value",
        value : ["death"]
    }
]

let arcane = (await ItemDialog.createFromFilters(filters, 8, "Choose 8 Arcane Spells & Lore of Death")).map(i => i.toObject());

filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "name",
        value: /^((?!\().)*$/gm, // Remove all spells with parentheses (all arcane spells spells)
        regex: true
    },
    {
        property : "system.lore.value",
        value : "necromancy"
    }
]

let necromancy = (await ItemDialog.createFromFilters(filters, 3, "Choose 3 from the Lore of Necromancy")).map(i => i.toObject());

let items = [...necromancy, ...petty, ...arcane]

this.actor.createEmbeddedDocuments("Item", items);