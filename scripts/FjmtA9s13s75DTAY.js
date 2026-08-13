let locs = Object.keys(this.actor.system.status.armour);

let location = locs[Math.floor(CONFIG.Dice.randomUniform() * (locs.length))];

game.wfrp4e.tables.formatChatRoll(`crit${location}`, {criticalLocation: location, showRoll: true});