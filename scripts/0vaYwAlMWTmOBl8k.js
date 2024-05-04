if (!args.flags.strikeToStun)
{
    args.flags.strikeToStun = true
    args.fields.modifier += 20;
    args.fields.hitLocation = "head";
}
args.fields.successBonus++;