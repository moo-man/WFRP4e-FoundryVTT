const {targetUuid} = this.effect.flags.wfrp4e;

if (args.actor.uuid !== targetUuid) return;

const recordedWounds = this.effect.getFlag("wfrp4e", "damageToReturn");

if (!recordedWounds) return;

args.modifiers.other.push({label: this.effect.name, value: recordedWounds});
args.totalWoundLoss += recordedWounds

this.effect.unsetFlag("wfrp4e", "damageToReturn");