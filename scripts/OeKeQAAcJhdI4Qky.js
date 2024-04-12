if (this.actor.hasCondition("stunned") || this.actor.hasCondition("unconscious"))
{
	this.script.scriptNotification("Disabled!");
	await this.effect.update({"disabled" : true})
}