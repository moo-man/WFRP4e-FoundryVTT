let test = this.effect.sourceTest;
if (test.failed && (test.result.roll % 11 == 0 || test.result.roll == 100))
{
	let points = await new Roll("1d10").roll({allowInteractive : false});
	game.dice3d?.showForRoll(points)
	this.actor.update({"system.status.corruption.value" : this.actor.system.status.corruption.value + points.total})
	this.script.message(`Gains ${points.total} Corruption`)
}
else 
{
	let points = this.effect.sourceTest.result.overcast.usage.other.current;
	this.actor.update({"system.status.corruption.value" : this.actor.system.status.corruption.value - points})
	this.script.message(`Loses ${points} Corruption`)
}