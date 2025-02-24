let lore = await ValueDialog.create({text : "Choose Lore", title:  "Lore"}, "", {"fire" : "Fire", "death" : "Death", "metal" : "Metal", "shadow" : "Shadow"});

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

let petty = await ItemDialog.createFromFilters(filters, 6, {title : this.effect.name, text : "Choose 6 Petty Spells"})


filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "system.lore.value",
        value : [""]
    }
]

let arcane = await ItemDialog.createFromFilters(filters, 12, {title : this.effect.name, text : "Choose 12 Arcane Spells"})

let items = petty.map(i => i.toObject()).concat(arcane.map(i => {
    let spell = i.toObject();
    spell.img = `modules/wfrp4e-core/icons/spells/${lore}.png`
    spell.system.lore.value = lore;
    return spell;
}));


this.actor.createEmbeddedDocuments("Item", items);