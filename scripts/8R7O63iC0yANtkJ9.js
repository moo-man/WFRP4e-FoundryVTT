if (this.item.equipped.value && this.actor.hasCondition("ablaze"))
{
  await this.actor.removeCondition("ablaze")
  this.script.notification(`Cannot acquire Ablaze Condition`,"info");
}