if (!["rLeg", "lLeg"].includes(this.effect.getFlag("wfrp4e", "location")))
	return true;

if (args.options.dodge)
{
	args.abort = true;
	this.script.scriptNotification("Cannot Dodge!")
}
return ["t", "int", "wp", "fel"].includes(args.characteristic)