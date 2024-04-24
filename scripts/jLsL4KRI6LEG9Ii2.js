if (args.test.result.critical && ['rLeg', 'lLeg'].includes(args.test.result.hitloc.result))
{
    args.test.result.critModifier = args.test.result.critModifier ? args.test.result.critModifier + 20 : 20
    args.test.result.critical += ` (+${args.test.result.critModifier})`
}