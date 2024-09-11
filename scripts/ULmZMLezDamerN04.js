let spells = await warhammer.utility.findAllItems("spell", "Loading Spells")

let lore = (await game.wfrp4e.tables.rollTable("random-caster", {hideDSN: true})).text
this.script.notification(lore)
if (lore == "GM's Choice") {
   return
}

else if (lore == "Arcane Magic") {
    lore = "Arcane"
}

else if (lore == "Petty Magic") {
    lore = "petty"
}

else {
    lore = lore.toLowerCase();
}

let spellsWithLore = []
if (lore == "Arcane") {
    spellsWithLore = spells.filter(i => !i.system.lore.value)
}
else {
    spellsWithLore = spells.filter(i => i.system.lore.value == lore)
}

let selectedSpell = spellsWithLore[Math.floor(CONFIG.Dice.randomUniform() * spellsWithLore.length)]
Item.implementation.create(selectedSpell.toObject(), { parent: this.actor}).then(item => {
    this.actor.setupCast(item).then(test => test.roll());
})