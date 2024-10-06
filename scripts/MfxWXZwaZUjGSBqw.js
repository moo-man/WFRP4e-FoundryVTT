if (this.actor.hasCondition("ablaze"))
{
    this.script.notification("Immune to Ablaze")
    await this.actor.hasCondition("ablaze")?.delete()
}