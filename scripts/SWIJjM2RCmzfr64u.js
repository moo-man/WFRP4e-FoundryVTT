if (args.test.result.hitloc.result == "head" && args.test.result.critical)
{
 args.test.result.critModifier = args.test.result.critModifier ? args.test.result.critModifier + 40 : 40

  args.test.result.critical += ` (+${args.test.result.critModifier})`
}
