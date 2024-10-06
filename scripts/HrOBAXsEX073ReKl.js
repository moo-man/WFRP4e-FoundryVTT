let skill = `${game.i18n.localize("NAME.Entertain")} (${game.i18n.localize("SPEC.Singing")})`;
let currentCareer = this.actor.system.currentCareer;
let existingSkill = this.actor.itemTypes.skill.find(i => i.name == skill);

if (!currentCareer) return


let inCurrentCareer = currentCareer.system.skills.concat(currentCareer.system.addedSkills).includes(skill);
let perfectPitchAdded = this.actor.getFlag("wfrp4e", "perfectPitchAdded") || {};
if (existingSkill && inCurrentCareer && !perfectPitchAdded[existingSkill.name])
{
	existingSkill.system.advances.costModifier = -5;
}
else 
{
	perfectPitchAdded[skill] = true;
	currentCareer.system.addedSkills.push(skill);
	foundry.utils.setProperty(this.actor, "flags.wfrp4e.perfectPitchAdded", perfectPitchAdded)
}


