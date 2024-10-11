let characteristics = {
    "ws" : 25,
    "bs" : 10,
    "s" : 15,
    "t" : 15,
    "i" : 25,
    "ag" : 20,
    "dex" : 0,
    "int" : 10,
    "wp" : 25,
    "fel" : 10
}
let skills = ["Cool", "Dodge", "Intimidate", "Intuition", "Leadership", "Lore (Warfare)", "Perception"]
let skillAdvancements = [15, 15, 15, 15, 15, 10, 10]
let talents = ["Combat Aware", "Combat Reflexes", "Feint", "Inspiring", "Resolute", "War Leader"]
let trappings = ["Hand Weapon", "Shield"]
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

updateObj.name = updateObj.name += " " + this.effect.name

await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);