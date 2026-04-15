if (args.test.item?.system?.attackType == "melee")
{
	if (parseInt(args.test.result.SL) < 0 || args.test.failed)
	{
		if (parseInt(args.test.result.SL) < 0)
		{
			args.test.result.SL = "+0";
			args.test.result.description = "Marginal Success"
		}
		args.test.result.outcome = "success"
        args.test.result.other.push(`<strong>${this.effect.name}</strong>: Minimum +0 SL`)
	}
}