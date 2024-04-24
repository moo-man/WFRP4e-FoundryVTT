let type = this.item.getFlag("wfrp4e", "breath");

if (["fire", "electricity", "poison"].includes(type))
{
    args.applyAP = false;
}