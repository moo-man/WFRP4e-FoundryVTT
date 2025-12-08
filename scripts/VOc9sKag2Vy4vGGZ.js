let specifier = this.item.specifier;
let rune;
let categories = [];
if (specifier && specifier.toLowerCase() != "all forms")
{
  if (specifier.includes("Talisman"))
  {
    categories.push("talisman");
  }
  if (specifier.includes("Protection"))
  {
    categories.push("protection");
  }
  if (specifier.includes("Weapon"))
  {
    categories.push("weapon");
  }
  if (specifier.includes("Armour"))
  {
    categories.push("armour");
  }
  if (specifier.includes("Engineering"))
  {
    categories.push("engineering");
  }

  if (categories.length)
  {
    let runes = await warhammer.utility.findAllItems("wfrp4e-dwarfs.rune", null, true, ["system.category", "system.master"]);
    let choices = runes.filter(i => categories.includes(i.system.category) && i.system.master);

    if (choices.length)
    {
      rune = (await ItemDialog.create(choices, 1, {title : this.effect.name, text : specifier, indexed: true}))[0]
    } 
    else 
    {
      rune = await DragDialog.create({text : `Provide Master Rune to learn (${specifier})`, title : this.effect.name, filter: (item) => item.type == "wfrp4e-dwarfs.rune" && item.system.master, onError: "Must provide a Master Rune"});
    }
  }
  else 
  {
    rune = await DragDialog.create({text : `Provide Master Rune to learn (${specifier})`, title : this.effect.name, filter: (item) => item.type == "wfrp4e-dwarfs.rune" && item.system.master, onError: "Must provide a Master Rune"});
  }
}
else 
{
  rune = await DragDialog.create({text : `Provide Master Rune to learn`, title : this.effect.name, filter: (item) => item.type == "wfrp4e-dwarfs.rune" && item.system.master, onError: "Must provide a Master Rune"});
}

this.actor.addEffectItems(rune.uuid, this.effect)

let talents = this.actor.itemTags.talent.filter(i => i.baseName == this.item.baseName);
let xpCost = talents.length * 100

if (this.actor.type == "character" && (await foundry.applications.api.DialogV2.confirm({window: {title: this.effect.name}, content: `<p>Spend ${xpCost} XP for learning ${this.item.name}?</p>`})))
{
  this.actor.update({"system.details.experience.log" : this.actor.system.addToExpLog(xpCost, this.item.name, this.actor.system.details.experience.spent + xpCost)})
}