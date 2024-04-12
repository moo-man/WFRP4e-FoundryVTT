let broken = this.actor.hasCondition("broken")
if (broken)
{
    broken.delete();
    this.script.scriptNotification("Removed Broken")
}