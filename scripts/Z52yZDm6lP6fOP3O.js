let ablaze = this.actor.hasCondition("ablaze")
if (ablaze)
{
    this.script.notification("Immune to Ablaze");
    ablaze.delete()
}