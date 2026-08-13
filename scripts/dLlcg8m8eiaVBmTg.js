if (this.effect.sourceActor)
{
 this.effect.updateSource({"system.changes": null});
  return;
}

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

this.effect.updateSource({"system.changes": [
  {key: "token.light.animation.type", type: "override", value: "flame"}, 
  {key: "token.light.dim", type: "override", value: 30}, 
  {key: "token.light.bright", type: "override", value: this.actor.system.characteristics.wp.bonus}, 
  {key: "token.light.color", type: "override", value: color}
]});