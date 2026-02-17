const hitLocation = args.test.hitloc.result
const hitLocationArmour = args.test.targets[0]?.armour[hitLocation]

if (hitLocationArmour)
{
  let qualities = [];
  for (let layer of hitLocationArmour.layers) 
  {
    qualities = qualities.concat(layer.source.system.qualities.value);
  }

  qualities = new Set(qualities); // remove duplicates;

  this.script.message(`Ignores ${Array.from(qualities).map(i => game.wfrp4e.config.armorQualities[i.name]).join(", ")}`);
}
