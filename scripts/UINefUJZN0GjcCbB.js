if (args.type == "cast")
{
  args.abort = true;
  this.script.notification("Cannot cast spells!");
}
return true;