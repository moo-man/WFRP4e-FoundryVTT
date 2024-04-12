if (["t", "wp"].includes(args.characteristic))
{
	args.fields.modifier += 10;
}
else if (["ag", "i", "int"].includes(args.characteristic))
{
	args.fields.modifier -= 10;
}