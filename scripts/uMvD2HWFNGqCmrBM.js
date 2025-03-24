if (args.test.options.addChargingDice)
{
	args.test.result.diceDamage = {formula: "1d10", value : Math.ceil(CONFIG.Dice.randomUniform() * 10) }
	args.test.result.additionalDamage += args.test.result.diceDamage.value;
}