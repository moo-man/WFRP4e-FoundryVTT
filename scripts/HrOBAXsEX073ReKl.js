let skill = `Entertain (Singing)`
let currentCareer = this.actor.system.currentCareer;
let existingSkill = this.actor.itemTypes.skill.find(i => i.name == skill);

if (!currentCareer) return


let inCurrentCareer = currentCareer.system.skills.includes(skill);
if (existingSkill && inCurrentCareer)
{
	existingSkill.system.advances.costModifier = -5;
}
else 
{
	currentCareer.system.skills.push(skill);
}


