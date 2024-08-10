let specification = Number(this.item.specification.value) || 1;
args.actor.system.details.price.gc -= Math.floor(args.actor.system.details.price.gc * 0.1 * specification);