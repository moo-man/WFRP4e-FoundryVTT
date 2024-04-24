if (getProperty(args.data, "system.status.fortune.value"))
{
	this.script.scriptNotification("Cannot update Fortune");
	delete args.data.system.status.wounds.value;
}