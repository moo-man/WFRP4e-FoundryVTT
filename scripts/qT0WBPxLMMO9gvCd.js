if (!this.actor.has("Night Vision") && !this.actor.has("Night Vision", "talent") && !this.actor.hasCondition("blinded"))
{
    this.actor.addCondition("blinded", 1, {"flags.wfrp4e.nightshroud" : true})
}