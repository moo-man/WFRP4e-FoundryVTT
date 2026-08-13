if (args.test.skill?.name == game.i18n.localize("NAME.Pray") || args.test.prayer)
{
    if (parseInt(args.test.result.SL) > 0)
    {
        args.test.result.SL = "+0";
        args.test.result.description = game.i18n.localize("ROLL.MarginalSuccess");
        args.test.result.other.push(`<strong>${this.effect.name}</strong>: Maximum +0 SL`)
    }
}