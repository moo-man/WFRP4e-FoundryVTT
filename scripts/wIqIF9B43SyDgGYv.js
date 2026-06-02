if (args.type == "effect" && args.options.action == "delete" && ["fatigued"].some(i => args.document.statuses.has(i)))
{
  this.script.notification("Cannot remove " + args.document.name);
  return false;
}