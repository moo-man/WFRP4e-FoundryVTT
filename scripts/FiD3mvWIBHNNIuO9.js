if (args.loc == "body")
{
   if ((await new Roll("1d2").roll()).total == 1)
   {
       args.loc = "head"
       args.AP = foundry.utils.deepClone(args.actor.status.armour[args.loc]);
       this.script.message(`Hit location changed to Head`)
   }
}