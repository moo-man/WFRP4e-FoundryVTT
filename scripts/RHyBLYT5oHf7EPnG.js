let skills = this.actor.itemTypes.skill.filter(i => i.name.includes(game.i18n.localize("NAME.Melee")))

let skill = await ItemDialog.create(skills, 1, "Select the skill used by the weapon")
let group = game.wfrp4e.utility.extractParenthesesText(skill[0]?.name)
let groupKey = warhammer.utility.findKey(group, game.wfrp4e.config.weaponGroups)

let weapon = {
	name : this.effect.name,
	type : "weapon",
	img : this.effect.img,
	system : {
		"damage.value" : this.actor.system.characteristics.wp.bonus,
		"weaponGroup.value" : groupKey || "basic",
		"twohanded.value" : ["polearm", "twohanded"].includes(groupKey),
		"reach.value" : "average",
		"qualities.value" : [{name : "magical"}]
	},
}

Item.implementation.create(foundry.utils.expandObject(weapon), {parent : this.actor, fromEffect : this.effect.id})
this.script.notification("Item created. Further customization must be done manually within the Item's sheet");