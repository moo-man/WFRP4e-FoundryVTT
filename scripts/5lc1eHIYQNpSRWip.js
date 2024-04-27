if (["death", "necromancy"].includes(args.spell?.system.lore.value))
{
    args.fields.successBonus += 1
}
else if(["life", "light", "heavens"].includes(args.spell?.system.lore.value))
{
    args.fields.modifier -= 10;
}