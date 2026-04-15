if (args.test.isCriticalFumble && args.test.context.dispel)
{
	if (parseInt(args.test.result.SL) > 0 || args.test.succeeded)
	{
		if (parseInt(args.test.result.SL) > 0)
		{
			args.test.result.SL = "-0";
			args.test.result.description = game.i18n.localize("ROLL.MarginalFailure");
		}
		args.test.result.outcome = "failure"
        args.test.result.other.push(`<strong>${this.effect.name}</strong>: Automatic Failure`)
	}

}