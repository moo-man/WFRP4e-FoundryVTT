if (this.effect.getFlag("wfrp4e", "fistsOfGork") && args.item.type == "skill" && args.item.name == "Melee (Brawling)") {
	args.item.system.modifier.value += this.effect.getFlag("wfrp4e", "fistsOfGork")
}