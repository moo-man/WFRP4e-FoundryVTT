const metal = () => {
  for (const [key, loc] of Object.entries(this.actor.armour)) {
    if (!loc.layers) continue;

    for (const layer of loc.layers) {
      if (layer.metal)
        return true;
    }
  }

  return false;
};

args.fields.slBonus -= metal() ? 2 : 1;