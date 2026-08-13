if (this.actor.system.status.fate?.value > 0 && (await this.script.dialog("Spend Fate?")))
{
  await this.actor.spend("system.status.fate.value");
  this.script.message("Spent Fate");
  await this.actor.addCondition("stunned");
  this.actor.update({"system.status.corruption.value" : this.actor.system.status.corruption.value + 1});
}
else 
{
  this.actor.addCondition("dead");
}