let lore = this.effect.name.split(" ")[2].toLowerCase();
if (args.item.type == "spell" && args.item.system.lore.value == lore)
{
    args.item.system.cn.value = Math.max(0, args.item.system.cn.value - 1);
}
