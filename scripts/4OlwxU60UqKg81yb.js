const target = args.actor;

if (target.has("Ethereal") || target.has("Corruption")) {
  args.totalWoundLoss += 6;
  args.modifiers.other.push({label: this.effect.name, value: 6})
}