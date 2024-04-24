let ablaze = this.actor.hasCondition("ablaze")
if (ablaze)
{
    this.script.scriptNotification("Immune to Ablaze");
    ablaze.delete()
}