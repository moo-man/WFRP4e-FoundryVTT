if (args.test.weapon.properties.qualities?.blast) {
  args.test.weapon.properties.qualities.blast.value ++;
  if (args.test.options.shortfuse) {
    args.test.result.other.push (`<strong>${this.effect.name}:</strong> Blast Rating increased`)
  }
  args.test.options.shortfuse = true
}