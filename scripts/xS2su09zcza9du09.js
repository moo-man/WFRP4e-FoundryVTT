if (["Minor", "Moderate", "Major"].includes(this.item.system.specification.value))
{
	return
}

let choice = await ItemDialog.create(ItemDialog.objectToArray({minor : "Minor", moderate : "Moderate", major : "Major"}, this.item.img), 1, "Choose Corruption Severity");

this.item.updateSource({"system.specification.value" : choice[0]?.name || ""})