const {targetUuid} = this.effect.flags.wfrp4e;

if (args.attacker.uuid !== targetUuid) return;

let recordedWounds = this.effect.getFlag("wfrp4e", "damageToReturn") ?? 0;

recordedWounds += args.totalWoundLoss;

this.effect.setFlag("wfrp4e", "damageToReturn", recordedWounds);