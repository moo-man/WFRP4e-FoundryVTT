let skill = `${game.i18n.localize("NAME.Trade")} (${this.item.parenthesesText})`
let currentCareer = this.actor.system.currentCareer;
let existingSkill = this.actor.itemTypes.skill.find(i => i.name == skill);

if (!currentCareer) return


let inCurrentCareer = currentCareer.system.skills.concat(currentCareer.system.addedSkills).includes(skill);
let craftsmanAdded = this.actor.getFlag("wfrp4e", "craftsmanAdded") || {};
if (existingSkill && inCurrentCareer && !craftsmanAdded[existingSkill.name])
{
	existingSkill.system.advances.costModifier = -5;
}
else 
{
	craftsmanAdded[skill] = true;
	currentCareer.system.addedSkills.push(skill);
	foundry.utils.setProperty(this.actor, "flags.wfrp4e.craftsmanAdded", craftsmanAdded)
}