const {targetUuid, characteristicsToSwap} = this.effect.flags.wfrp4e;

if (!characteristicsToSwap) return;

const target = fromUuidSync(targetUuid);

if (!target) return;

for (const char of characteristicsToSwap) {
  args.actor.system.characteristics[char].advances = target.system.characteristics[char].advances;
  args.actor.system.characteristics[char].bonus = target.system.characteristics[char].bonus;
  args.actor.system.characteristics[char].bonusMod = target.system.characteristics[char].bonusMod;
  args.actor.system.characteristics[char].calculationBonusModifier = target.system.characteristics[char].calculationBonusModifier;
  args.actor.system.characteristics[char].initial = target.system.characteristics[char].initial;
  args.actor.system.characteristics[char].modifier = target.system.characteristics[char].modifier;
  args.actor.system.characteristics[char].value = target.system.characteristics[char].value;
}