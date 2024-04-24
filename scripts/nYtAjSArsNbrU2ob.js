if (["ag", "i", "int"].includes(args.characteristic))
{
    args.fields.modifier -= 10;
}
else if (["wp"].includes(args.characteristic))
{
    args.fields.modifier += 10;
}