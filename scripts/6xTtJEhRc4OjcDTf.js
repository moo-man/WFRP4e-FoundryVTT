if (foundry.utils.getProperty(args.data, "system.status.fortune.value"))
{
	this.script.notification("Cannot update Fortune");
	delete args.data.system.status.wounds.value;
}