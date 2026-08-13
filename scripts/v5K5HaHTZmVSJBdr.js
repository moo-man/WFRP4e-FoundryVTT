let bane = this.effect.specifier;
if (bane)
  return;
if (await this.script.dialog("Roll Bane?"))
{
  let table = await fromUuid("Compendium.wfrp4e-archives2.tables.RollTable.wRfrOW5pRXRWM8Lb");
  if (table)
  {
    bane = (await table.draw()).results[0].name;
  }
  else
  {
    this.script.notification("Random Creature table not found!", "error");
  }
}

if (!bane)
{
  bane = await ValueDialog.create({text: "Enter Bane", title: this.effect.name}) 
}

if (bane)
{
  this.effect.updateSource({name: this.effect.setSpecifier(bane)});
}