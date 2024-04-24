if(args.opposedTest.attackerTest.item?.isRanged && args.applyAP && !args.sureShot)
{
   if (args.modifiers.ap.value)
   {
    args.sureShot = true;
    args.modifiers.ap.details.push(`${this.effect.name} (Ignore ${this.item.Advances})`)
    args.modifiers.ap.ignored += this.item.Advances;
   }
}