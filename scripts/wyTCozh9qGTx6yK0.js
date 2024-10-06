if (args.options.terror || args.extendedTest?.getFlag("wfrp4e", "fear"))
{
	args.abort = true;
	this.script.notification("Does not need to make Fear or Terror tests");
}