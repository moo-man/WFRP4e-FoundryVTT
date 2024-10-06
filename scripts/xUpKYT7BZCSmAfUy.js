if (this.item.system.quantity.value)
{
	this.item.system.reduceQuantity();
	let actor = Array.from(game.user.targets)[0]?.actor || this.actor;
	actor.applyEffect({effectData : [this.item.effects.contents[0].convertToApplied()]})
}
else
{
	this.script.notification("None left!", "error")
}