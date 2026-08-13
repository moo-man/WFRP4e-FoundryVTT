if (!(await this.script.dialog("This process is irreversible, continue?")))
{
  return;
}

let items = [this.actor.itemTypes.talent.find(i => i.baseName == "Bless"), this.actor.itemTypes.talent.find(i => i.baseName == "Invoke")].filter(i => i);
let skill = this.actor.itemTypes.skill.find(i => i.name == game.i18n.localize("NAME.Pray"));

this.script.notification("Removing " + items.map(i => i.name).join(", "));
await Promise.all(items.map(i => i.delete()));

if (skill)
{ 
  this.script.notification(`Removing Pray Advances (${skill.system.advances.value})`)
  skill.update({"system.advances.value" : 0}, {skipExperienceChecks : true})
}

for(let i of this.actor.itemTypes.prayer)
{
  i.delete();
}