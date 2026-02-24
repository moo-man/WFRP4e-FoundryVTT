if (args.type == "effect" && args.options.action == "create" && ["ablaze"].some(i => args.document.statuses.has(i)))
{
  this.script.notification("Immune to " + args.document.name);
  return false;
}