let characteristics = {
  "ws" : -10,
  "bs" : -10,
  "s" : 0,
  "t" : 15,
  "i" : 15,
  "ag" : -20,
  "dex" : 0,
  "int" : 20,
  "wp" : 10,
  "fel" : 10
}
let skills = ["Charm", "Channelling", "Entertain (Prophecy)", "Intuition"]
let skillAdvancements = [0, 0, 20, 10]
let talents = ["Detect Artefact", "Menacing", "Sixth Sense"]
let traits = ["Dooming", "Spellcaster (Lore of Life)", "Ward"]
let trappings = []
let items = [];
let spells = ["Forest of Thorns"];

let updateObj = this.actor.toObject();

for (let ch in characteristics)
{
  updateObj.system.characteristics[ch].modifier += characteristics[ch];
}

for (let index = 0; index < skills.length; index++)
{
  let skill = skills[index]
  let skillItem;
  skillItem = updateObj.items.find(i => i.name == skill && i.type == "skill")
  if (skillItem)
      skillItem.system.advances.value += skillAdvancements[index]
  else 
  {
      skillItem = await game.wfrp4e.utility.findSkill(skill)
      skillItem = skillItem.toObject();
      skillItem.system.advances.value = skillAdvancements[index];
      items.push(skillItem);
  }
}

for (let talent of talents)
{
  let talentItem = await game.wfrp4e.utility.findTalent(talent)
  if (talentItem)
  {
      items.push(talentItem.toObject());
  }
  else 
  {
      ui.notifications.warn(`Could not find ${talent}`, {permanent : true})
  }
}

const traitRegex = /(?:,?(.+?)(\+?\d{1,2}\+?)?\s*?(?:\((.+?)\)\s*(\+?\d{1,2})?|,|$))/gm
for (let trait of traits)
{
  let traitMatches = trait.matchAll(traitRegex).next().value
  let traitName = traitMatches[1]
  let traitVal = traitMatches[2] || traitMatches[4] // could be match 2 or 4 depending on if there's a specialization
  let traitSpec = traitMatches[3]

  let traitItem;
  try {
      traitItem = await WFRP_Utility.findItem(traitName, "trait")
  }
  catch { }
  if (!traitItem) {
      ui.notifications.warn(`Could not find ${trait}`, {permanent : true})
  }
  traitItem = traitItem.toObject()

  if (Number.isNumeric(traitVal))
  {
      traitItem.system.specification.value = traitName.includes('Weapon','Horns','Tail','Tentacles','Bite') ? traitVal - parseInt(characteristicValues[3]/10) : traitVal;
      traitItem.name = (traitItem.name +  ` ${traitSpec ? "("+ traitSpec + ")" : ""}`).trim()
  }
  else 
      traitItem.system.specification.value = traitSpec

  items.push(traitItem)

}

for (let trapping of trappings) 
{
  let trappingItem = await game.wfrp4e.utility.findItem(trapping)
  if (trappingItem)
  {
      trappingItem = trappingItem.toObject()

      equip(trappingItem)

      items.push(trappingItem);
  }
  else 
  {
      ui.notifications.warn(`Could not find ${trapping}`, {permanent : true})
  }
}

for (let spell of spells) 
{
  let spellItem = await game.wfrp4e.utility.findItem(spell)
  if (spellItem)
  {
      spellItem = spellItem.toObject()

      items.push(spellItem);
  }
  else 
  {
      ui.notifications.warn(`Could not find ${spell}`, {permanent : true})
  }
}

updateObj.name = updateObj.name += " " + this.effect.name

await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);


function equip(item)
{
  if (item.type == "armour")
      item.worn = true
  else if (item.type == "weapon")
      item.equipped = true
  else if (item.type == "trapping" && item.trappingType?.value == "clothingAccessories")
      item.worn = true
}