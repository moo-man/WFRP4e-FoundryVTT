if (args.test.options.doombolt && !args.test.options.doomboltRolled)
{
	args.test.options.doomboltRolled = true;

	let test = await this.actor.setupSkill(`${game.i18n.localize("NAME.Language")} (${game.i18n.localize("SPEC.Magick")})`, {fields : {difficulty : "hard"}, context : {failure : "@Table[majormis]{Major Miscast}"}});
	await test.roll();

	if (test.succeeded)
	{
		args.test.preData.additionalDamage = 4;
	}
}