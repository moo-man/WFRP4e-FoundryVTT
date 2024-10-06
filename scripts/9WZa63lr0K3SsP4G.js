let sourceItem = this.effect.sourceItem;

if (sourceItem)
{
	this.actor.applyEffect({effectUuids : [sourceItem.effects.contents[2].uuid]})
	this.script.notification("Applied after effects");
}