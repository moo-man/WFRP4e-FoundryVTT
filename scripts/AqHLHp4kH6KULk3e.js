if (this.item.system.quantity.value)
{
	this.item.system.reduceQuantity();
	let actor = Array.from(game.user.targets)[0]?.actor || this.actor;
    let effectData = this.item.effects.contents[0].convertToApplied();
	effectData.system.sourceData.item = this.item.uuid
	actor.applyEffect({effectData : [effectData]})
}
else
{
	this.script.notification("None left!", "error")
}