let poisoned = this.actor.hasCondition("poisoned")
if (poisoned)
{
    this.script.message("Immune to Poisoned")
    poisoned.delete()
}