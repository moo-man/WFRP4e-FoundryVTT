args.flags.earCount = Number.isNumeric(args.flags.earCount) ? args.flags.earCount+1 : 1;
if (args.characteristic == "fel")
{
	args.fields.modifier -= 5;
}
if (args.flags.earCount == 2 && args.skill?.name == game.i18n.localize("NAME.Perception"))
{
	args.fields.modifier -= 20;
}
