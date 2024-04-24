if (this.actor.hasCondition("ablaze"))
{
    this.script.scriptNotification("Immune to Ablaze")
    await this.actor.hasCondition("ablaze")?.delete()
}