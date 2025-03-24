if (this.actor && this.actor?.name !== "Kurgorn Three-eyes" && !this.actor.hasCondition("blinded") && !args.itemUpdated)
{
  this.script.notification(`Cannot remove Blinded condition.`);
  await this.actor.addCondition("blinded", 1, {statuses : ["blinded", "blind"]})
}