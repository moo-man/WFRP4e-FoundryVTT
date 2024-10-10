let characteristics = {
    "ws" : 10,
    "bs" : 0,
    "s" : 5,
    "t" : 5,
    "i" : 10,
    "ag" : 0,
    "dex" : 0,
    "int" : 0,
    "wp" : 0,
    "fel" : 0
}
let skills = ["Cool", "Dodge", "Language (Battle)"]
let skillAdvancements = [10, 10, 10]

let talents = ["Combat Reflexes", "Resolute"]
let trappings = ["Plate Breastplate", "Plate Bracers", "Plate Helm", "Plate Leggings"]

let items = [];

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

for (let trapping of trappings) 
{
    let trappingItem = await game.wfrp4e.utility.findItem(trapping)
    if (trappingItem)
    {
        trappingItem = trappingItem.toObject()

        trappingItem.system.equipped.value = true;

        items.push(trappingItem);
    }
    else 
    {
        ui.notifications.warn(`Could not find ${trapping}`, {permanent : true})
    }
}

let weapons = await warhammer.utility.findAllItems("weapon", "Loading Weapons");

items = items.concat((await game.wfrp4e.apps.ItemDialog.create([await fromUuid("Compendium.wfrp4e-core.items.Item.1zaqojk0Oq1m8vYv"), await fromUuid("Compendium.wfrp4e-core.items.Item.bBX8MP6QfcyU6Fy3")], 1, "Choose a Weapon")) || [])

let choices = weapons.filter(i => i.system.properties.qualities.shield || i.system.weaponGroup.value == "polearm" || i.system.weaponGroup.value == "twohanded");

items = items.concat(await game.wfrp4e.apps.ItemDialog.create(choices, 1, "Choose a Shield or Polearm or Two-Handed Weapon"));

updateObj.name = updateObj.name += " " + this.effect.name

await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);
