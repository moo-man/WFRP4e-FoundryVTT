let item = args.actor.items.find(i => i.name.includes("Flying Jib"));
item.name += ` (Disabled by ${this.item.name})`;