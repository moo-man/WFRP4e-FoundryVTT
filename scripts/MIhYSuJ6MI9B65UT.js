let specification = Number(this.item.specification.value) || 1;
args.actor.system.status.wounds.max += Math.floor(args.actor.system.status.wounds.max * 0.3 * specification);
args.actor.system.status.carries.max -= Math.floor(args.actor.system.status.carries.max * 0.1 * specification);
args.actor.system.details.price.gc += Math.floor(args.actor.system.details.price.gc * 0.2 * specification);