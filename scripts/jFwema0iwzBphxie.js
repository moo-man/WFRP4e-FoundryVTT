let woundsGained = Math.min(args.actor.status.wounds.value, args.totalWoundLoss)
woundsGained = Math.ceil(woundsGained / 2)

args.attacker.update({"system.status.wounds.value" : args.attacker.system.status.wounds.value + woundsGained})

args.actor.addCondition("fatigued")
args.attacker.hasCondition("fatigued")?.delete();

this.script.message(`<b>${args.attacker.prototypeToken.name}</b> gains ${woundsGained} Wounds`);