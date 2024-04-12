args.test.result.critModifier = args.test.result.critModifier || 0;
args.test.result.critModifier += 20;

if (args.test.result.critical)
{
    args.test.result.critical = `${game.i18n.localize("Critical")} (+${args.test.result.critModifier})`
}