if (args.extendedTest?.getFlag("wfrp4e", "fear"))
{
	this.script.notification("Immune to Fear");
	args.extendedTest.delete();
	args.abort = true;
}
return args.options.terror || args.extendedTest?.getFlag("wfrp4e", "fear")