if (args.context.dodge)
{
	args.abort = true;
	this.script.notification("Cannot Dodge!")
}
return ["t", "int", "wp", "fel"].includes(args.characteristic)