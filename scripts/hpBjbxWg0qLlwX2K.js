let lores = [
    {id: "beasts", name: "Ghur", table: "ghur-marks", img: "modules/wfrp4e-core/icons/spells/beasts.png"},
    {id: "death", name: "Shyish", table: "shyish-marks", img: "modules/wfrp4e-core/icons/spells/death.png"},
    {id: "fire", name: "Aqshy", table: "aqshy-marks", img: "modules/wfrp4e-core/icons/spells/fire.png"},
    {id: "heavens", name: "Azyr", table: "azyr-marks", img: "modules/wfrp4e-core/icons/spells/heavens.png"},
    {id: "life", name: "Ghyran", table: "ghyran-marks", img: "modules/wfrp4e-core/icons/spells/life.png"},
    {id: "light", name: "Hysh", table: "hysh-marks", img: "modules/wfrp4e-core/icons/spells/light.png"},
    {id: "metal", name: "Chamon", table: "chamon-marks", img: "modules/wfrp4e-core/icons/spells/metal.png"},
    {id: "shadow", name: "Ulgu", table: "ulgu-marks", img: "modules/wfrp4e-core/icons/spells/shadow.png"},
];

let ownedLores = this.actor.itemTypes.spell.reduce((owned, spell) => owned.concat(spell.system.lore.value.filter(l => lores.map(i => i.id).includes(l))), []);

if (ownedLores.length != 0)
{
    lores = lores.filter(i => ownedLores.includes(i.id));
}

let chosen = await ItemDialog.create(lores, 1, {text: "Select Arcane Mark Table", title: this.effect.name})

if (chosen[0])
{
    game.wfrp4e.tables.formatChatRoll(chosen[0].table, {showRoll: true});
}