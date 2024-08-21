let woundsGained = Math.min(args.totalWoundLoss, args.actor.status.wounds.value)

woundsGained = Math.floor(woundsGained / 2)

args.attacker.update({ "system.status.wounds.value": args.attacker.status.wounds.value + woundsGained })

this.script.message(`Gains ${woundsGained} Wounds`)