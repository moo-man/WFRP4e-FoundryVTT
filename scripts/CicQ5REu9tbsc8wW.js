const locations = [];

for (let [key, loc] of Object.entries(args.AP)) {
  if (loc.layers?.some(i => !i.metal && i.source?.system.tags?.has("armour")))
    locations.push(key);
}

this.actor.status.addArmour(1, {source: this.effect, magical: true, locations})