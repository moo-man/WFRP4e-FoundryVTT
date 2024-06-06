let specification = Number(this.item.specification.value) || 1;
args.actor.system.characteristics.t.initial += 10 * specification;
args.actor.system.status.carries.max -= Math.floor(args.actor.system.status.carries.max * 0.1 * specification);
args.actor.system.details.price.gc += args.actor.system.details.price.gc * 0.1 * specification;