if (args.item.system.tags.has("armour"))
{
  
for(let key in args.item.system.AP)
{
  if (args.item.system.AP[key])
  {
    args.item.system.AP[key] += 2;
  }
  }
}