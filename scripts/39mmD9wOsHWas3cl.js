if (args.type == "effect" && args.options.action == "delete" && ["prone"].some(i => args.document.statuses.has(i)))
{
  this.script.notification("Cannot remove " + args.document.name);
  let resist = await this.effect.resistEffect();
  if (resist)
  {
    this.effect.delete();
  }
  return resist;
}