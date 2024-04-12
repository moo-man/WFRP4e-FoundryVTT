if (args.test.preData.options?.corruption && args.test.failed) {
  args.test?.result?.other.push("Gain additional +1 Corruption from " + this.effect.name)
}