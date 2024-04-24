if ((args.item.type == "weapon" || args.item.system.attackType) && !args.item.isMagical )
{
    args.item.system.qualities.value.push({name : "magical"})
}