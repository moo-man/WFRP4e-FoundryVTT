if (args.opposedTest.result.hitloc.value == "body")
{
   if ((await new Roll("1d2").roll()).total == 1)
   {
       args.opposedTest.result.hitloc.value = "head"
       this.script.message(`Hit location changed to Head`)
   }
}