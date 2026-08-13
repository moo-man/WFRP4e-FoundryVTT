if (args.skill?.name.includes("Language"))
{
  args.abort = true;
  this.script.notification("Cannot make Language Tests!")
}