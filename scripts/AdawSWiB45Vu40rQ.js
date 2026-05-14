let colors = {
    fire : "#b22222",
    heavens : "#87ceeb",
    metal : "#ee9b3a",
    shadow : "#808080",
    life : "#008000",
    beasts : "#a52a2a",
    light : "#f0ffff",
    death : "#800080",
    necromancy : "#800080",
    daemonology : "#8b0000"
};

let spell = this.actor.itemTypes.spell.find(i => Object.keys(colors).includes(i.system.lore.value[0]));

let color;
if (spell)
{
    color = colors[spell.system.lore.value[0]];
}
else 
{
    color = Object.values(colors)[Math.ceil(CONFIG.Dice.randomUniform() * 10)];
}

this.effect.updateSource({changes: this.effect.changes.concat({key: "token.light.color", type: "override", value: color})});