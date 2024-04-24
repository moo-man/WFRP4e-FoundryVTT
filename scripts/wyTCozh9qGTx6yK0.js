if (args.options.terror || args.extendedTest?.getFlag("wfrp4e", "fear"))
{
	args.abort = true;
	this.script.scriptNotification("Does not need to make Fear or Terror tests");
}