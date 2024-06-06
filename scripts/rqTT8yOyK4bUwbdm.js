let test = args.test
if (test.spell.lore.value == "fire")
{
   if (test.result.overcast.usage.target?.AoE)
   {
       test.result.overcast.usage.target.current += test.actor.characteristics.wp.bonus
       test.result.overcast.usage.target.initial += test.actor.characteristics.wp.bonus
    }
   if (test.result.overcast.usage.range)
   {
       test.result.overcast.usage.range.current *= 2
       test.result.overcast.usage.range.initial *= 2
   }
 
}