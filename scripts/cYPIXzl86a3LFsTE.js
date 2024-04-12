if (args.item.type == "spell")
{
   args.item.cn.value -=2
   if (args.item.cn.value < 0)
      args.item.cn.value = 0
}