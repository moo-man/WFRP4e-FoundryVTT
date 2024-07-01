if (args.item.name == game.i18n.localize("NAME.MagicResistanceTrait") && args.item.type == "trait")
{
    args.item.system.specification.value = Number(args.item.system.specification.value) + 1
}