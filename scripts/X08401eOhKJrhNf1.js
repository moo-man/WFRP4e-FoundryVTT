const grim = this.actor.items.find(i => i.type === "trait" && i.name.includes("Grim"));

if (args.options?.deltaAdv > 0 && this.actor.hasCondition("engaged") && grim.specification.value !== 4) {
  grim.update({"system.specification.value": 4});
}

if (!this.actor.hasCondition("engaged") && grim.specification.value !== 2) {
  grim.update({"system.specification.value": 2});
}