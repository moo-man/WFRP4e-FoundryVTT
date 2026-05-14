if (args.sourceTest.options.doubleDamage)
{ 
  args.modifiers.other.push({label: this.effect.name, value: args.totalWoundLoss});
  args.totalWoundLoss *= 2;
}