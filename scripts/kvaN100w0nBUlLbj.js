let poisoned = this.actor.hasCondition("poisoned")
if (poisoned)
{
    this.script.scriptMessage("Immune to Poisoned")
    poisoned.delete()
}