let locs = Object.values(this.actor.system.status.armour).map(i => i.label).filter(i => i);

let location = locs[Math.floor(CONFIG.Dice.randomUniform() * (locs.length))];

this.script.notification(location);

this.effect.updateSource({name: this.effect.setSpecifier(location)});