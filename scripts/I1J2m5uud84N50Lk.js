if (["cast", "channelling", "pray"].includes(args.type))
{
	args.abort = true;
	this.script.notification("Cannot cast Spells or use Prayers");
}
else return true;