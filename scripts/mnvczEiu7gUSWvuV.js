if (args.test.options.flags.skewering)
{
  args.test.result.tables.critical = {
    label : "Critical (if successful attack)",
      class : "critical-roll",
        modifier : args.test.result.critModifier || 0,
        key: `crit${args.test.result.hitloc.result}`
    
  }
}