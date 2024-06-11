if ([game.i18n.localize("CORRUPTION.Minor"), game.i18n.localize("CORRUPTION.Moderate"), game.i18n.localize("CORRUPTION.Major")].includes(this.item.system.specification.value))
{
	return
}

let choice = await ItemDialog.create(ItemDialog.objectToArray({minor : game.i18n.localize("CORRUPTION.Minor"), moderate : game.i18n.localize("CORRUPTION.Moderate"), major : game.i18n.localize("CORRUPTION.Major")}, this.item.img), 1, "Choose Corruption Severity");

this.item.updateSource({"system.specification.value" : choice[0]?.name || ""})