const stupid = this.actor.items.find(i => i.name === "Stupid");

if (!stupid) return;

await stupid.update({"system.disabled": true});