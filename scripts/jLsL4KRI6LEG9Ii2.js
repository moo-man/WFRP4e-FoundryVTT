if (args.test.result.tables.critical && ['rLeg', 'lLeg'].includes(args.test.result.hitloc.result))
{
    args.test.result.tables.critical.modifier += 20;
}