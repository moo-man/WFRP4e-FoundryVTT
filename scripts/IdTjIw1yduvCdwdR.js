if (args.type == "effect" && args.options.action == "delete" && ["blinded"].some(i => args.document.statuses.has(i)))
{
  this.script.notification("Cannot remove " + args.document.name);
  return false;
}