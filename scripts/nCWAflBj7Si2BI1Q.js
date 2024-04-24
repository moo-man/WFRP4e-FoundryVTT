if (args.item.type == "spell" && args.item.system.lore.value != "petty")
{
    args.item.cn.value = Math.max(4, args.item.cn.value * 2)
}