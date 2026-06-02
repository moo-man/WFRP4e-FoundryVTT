if (args.skill?.name == game.i18n.localize("NAME.Pray") || args.prayer)
{
  args.abort = true;
  this.script.notification("Cannot enact Pray Tests!")
}

return true;