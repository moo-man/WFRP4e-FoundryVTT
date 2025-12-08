if (args.test.succeeded) {
  args.test.result.critical = "Critical"
  
  args.test.result.tables.critical = {
    label : args.test.result.critical,
    class : "critical-roll",
    modifier : args.test.result.critModifier,
    key: `crit${args.test.result.hitloc.result}`
  }
  
  args.test.result.other.push (`<strong>${this.effect.name}:</strong> All successes are criticals.`)

}