if (args.extendedTest?.getFlag("wfrp4e", "fear"))
{
	this.script.scriptNotification("Immune to Fear");
	args.extendedTest.delete();
	args.abort = true;
}