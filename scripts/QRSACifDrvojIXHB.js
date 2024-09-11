if (!this.actor.effects.find(e => e.isCondition))
{
	return this.script.notification("No Conditions on this Actor")
}

let choice = await ItemDialog.create(this.actor.effects.filter(i => i.isCondition), 1, "Choose a Condition")

if (choice[0])
{
	this.actor.removeCondition(choice[0].conditionId)
}
