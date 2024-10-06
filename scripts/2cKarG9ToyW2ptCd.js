if (this.item.system.quantity.value)
{
	this.item.update({"system.quantity.value" : this.item.system.quantity.value - 0.25})
	let actor = Array.from(game.user.targets)[0]?.actor || this.actor;
	actor.applyEffect({effectData : [this.item.effects.contents[1].convertToApplied()]})
}
else
{
	this.script.notification("None left!", "error")
}