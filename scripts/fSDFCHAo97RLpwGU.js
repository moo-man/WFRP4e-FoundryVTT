const hitLocation = args.test.hitloc.result
const hitLocationArmour = args.test.targets[0].armour[hitLocation]

if (hitLocationArmour.layers.length > 0) {
  hitLocationArmour.layers.forEach(layer => {
    layer.source.system.qualities.value = [];
    layer.impenetrable = false;
  });
}