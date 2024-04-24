let robust = args.modifiers.other.find(i => i.key == "robust")
if (robust)
{
	robust.value--;
}
else 
{
	args.modifiers.other.push({key: "robust", label : this.effect.name, value : -1})
}
