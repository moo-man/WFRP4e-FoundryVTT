if (args.opposedTest?.attackerTest?.weapon?.name.toLowerCase().includes("unarmed")) {
  const sl = this.effect.getFlag("wfrp4e-archives3", "sl");
  args.totalWoundLoss += sl;
  args.modifiers.other.push({label: this.effect.name, value: sl});
}