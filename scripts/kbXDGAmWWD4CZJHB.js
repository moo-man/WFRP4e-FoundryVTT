const sin = this.effect.sourceActor.system.status.sin.value;
const roll = new Roll(`2d10 - ${sin}`);
await roll.evaluate();
await roll.toMessage({flavor: `${this.effect.name}`});
this.actor.system.status.mood.addEntry(`${this.effect.name} (${this.effect.sourceActor.name})`, roll.total);