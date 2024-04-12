if (args.item.type == "spell")
{
   let range = parseInt(args.item.Duration)
   if (Number.isNumeric(range))
   {
          args.item.system.duration.value = "2 * " + args.item.system.duration.value
   }
}