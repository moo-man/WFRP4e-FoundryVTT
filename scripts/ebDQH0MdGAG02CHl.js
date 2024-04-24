let item = await fromUuid("Compendium.wfrp4e-core.items.SYjWiKDzMS6CtROJ")
let data = item.toObject();
data.system.location.key = this.item.system.location.key
if (this.item.system.location.key == "rArm")
{
	data.system.location.value = "Right Hand"
	data.system.location.key = "rHand"
}
else if (this.item.system.location.key == "lArm")
{
	data.system.location.value = "Left Hand"
	data.system.location.key = "lHand"
}
this.actor.createEmbeddedDocuments("Item", [data])