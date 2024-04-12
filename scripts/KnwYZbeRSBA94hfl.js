if (!args.flags.lostFingers)
{
	args.flags.lostFingers = true;
	args.fields.modifier -= 5 * this.actor.flags.useless[this.item.system.location.key]
}