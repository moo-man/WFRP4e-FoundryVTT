if (args.prayer)
{
  args.abort = true;
  this.script.notification("Cannot use Bless or Invoke!")
}

return true;