let criticals = this.actor.itemTypes.critical;

if (criticals.length)
{
  let choice = await ItemDialog.create(criticals, 1, {title: this.effect.name, text: "Choose Critical to Heal"})

  if (choice[0])
  {
    this.script.message(`Healed ${choice[0].name}`);
    choice[0].delete();
  }
}
else 
{
  this.script.notification("No Critical Wounds!")
}