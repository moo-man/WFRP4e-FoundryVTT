let skills = this.actor.itemTypes.skill.filter(i => i.name == "Language (Magick)" || i.name.includes("Channelling"))
for(let skill of skills)
{
  await skill.update({"system.modifier.value" : -1 * skill.system.total.value})
}

this.script.notification("Added modifiers to Skills: " + skills.map(i => i.name).join(", "), "info", true);