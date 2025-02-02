const stupid = this.actor.items.find(i => i.name === "Stupid");

if (!stupid) return;


if (this.item.system.disabled) {
  await stupid.update({"system.disabled": false});
} else {
  await stupid.update({"system.disabled": true});
}