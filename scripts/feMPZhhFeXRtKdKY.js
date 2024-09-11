if (this.item.system.quantity.value)
{
	this.item.system.reduceQuantity();
	let actor = Array.from(game.user.targets)[0]?.actor || this.actor;
	actor.applyEffect({effectUuids : this.item.effects.contents[0]?.uuid})
}
else
{
	this.script.notification("None left!", "error")
}