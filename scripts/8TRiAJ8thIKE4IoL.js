
let SL = Number(foundry.utils.getProperty(this.item, "flags.wfrp4e.sourceTest.result.SL") || 1)

args.actor.characteristics.i.modifier += 10 * SL
args.actor.characteristics.ag.modifier += 10 * SL