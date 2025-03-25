let spells = await warhammer.utility.findAllItems("spell", "Loading Spells", true, ["system.lore.value"]);

spells = spells.filter(i => ["dark", "light", "fire", "life", "beasts", "shadows", "death", "heavens", "metal"].includes(i.system.lore.value)).sort((a, b) => a.name > b.name ? 1 : -1);

let choices = await ItemDialog.create(spells, 7, {text : "Choose 7 taken from any combination of spells from Colour Magic Lore, the Lore of Witchcraft, or Lore of Dark Magic", title : this.effect.name})

this.actor.addEffectItems(choices.map(i => i.uuid), this.effect)