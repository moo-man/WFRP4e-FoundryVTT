let locs = Object.keys(this.actor.system.status.armour);

let location = locs[Math.floor(CONFIG.Dice.randomUniform() * (locs.length))];

let roll = await new Roll("1d10 * 5").roll();
roll.toMessage(this.script.getChatData({flavor: "Modifier"}));

game.wfrp4e.tables.formatChatRoll(`crit${location}`, {criticalLocation: location, modifier: roll.total, showRoll: true});