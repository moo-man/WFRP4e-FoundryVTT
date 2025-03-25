let spells = await warhammer.utility.findAllItems("spell", "Loading Spells", true, ["system.lore.value"])
spells = spells.filter(s => ["fire", "heavens", "beasts", "shadow", "light", "life", "death", "metal"].includes(s.system.lore.value)).sort((a, b) => a.system.lore.value > b.system.lore.value ?  1 : -1)

let choice = await ItemDialog.create(spells, 1, {text : "Choose Spell", title : this.effect.name});
if (choice[0])
{
    this.actor.addEffectItems(choice.map(i => i.uuid), this.effect)
}
