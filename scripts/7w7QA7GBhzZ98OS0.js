const sin = this.effect.sourceActor.system.status.sin.value;
const result = await WFRP_Tables.rollTable("manann-mood-made-meaningless", sin);
let match = result.text.match(/b>([^<]+)/i);
let key = match[1];
let roll = new Roll("5d10");
let value = undefined;

await this.script.message(result.text, {flavor: result.title});

switch (key) {
  case 'Stromfels Triumphant!':
    value = 0;
    break;
  case 'Stromfels Ascends!':
    await roll.evaluate();
    if (this.actor.system.status.mood.value > 0)
      value = -roll.total;
    else if (this.actor.system.status.mood.value < 0)
      value = roll.total;
    break;
  case 'No effect.':
    break;
  case 'Manann Provoked!':
    await roll.evaluate();
    value = -roll.total;
    break;
}

if (roll._evaluated)
  await roll.toMessage();

await this.effect.setFlag("wfrp4e-soc", "m4result", {result: key, value});