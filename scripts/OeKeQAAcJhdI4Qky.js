if (this.actor.hasCondition("stunned") || this.actor.hasCondition("unconscious"))
{
	this.script.notification("Disabled!");
	await this.effect.update({"disabled" : true})
}