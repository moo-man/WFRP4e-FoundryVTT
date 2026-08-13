let locs = Object.values(this.actor.system.status.armour).map(i => i.label).filter(i => i);

let location = locs[Math.floor(CONFIG.Dice.randomUniform() * (locs.length))];

let duration = await new Roll("1d10").roll();
duration.toMessage(this.script.getChatData());
this.effect.updateSource({name: this.effect.setSpecifier(location), duration: {value: duration.total, units: "hours"}});