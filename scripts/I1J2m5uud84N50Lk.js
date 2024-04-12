if (["cast", "channelling", "pray"].includes(args.type))
{
	args.abort = true;
	this.script.scriptNotification("Cannot cast Spells or use Prayers");
}
else return true;