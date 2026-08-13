if (args.item.type == "skill" && (args.item.name == "Language (Magick)" || args.item.name.includes("Channelling")))
{
    args.item.system.modifier.value -= Math.floor(args.item.system.advances.value / 2)
}