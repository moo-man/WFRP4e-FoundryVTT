let characteristics = {
    "ws" : 10,
    "bs" : 0,
    "s" : 10,
    "t" : 10,
    "i" : 20,
    "ag" : 10,
    "dex" : 0,
    "int" : 0,
    "wp" : 15,
    "fel" : 0
}
let skills = ["Cool", "Dodge", "Intimidate", "Leadership"]
let skillAdvancements = [15, 15, 10, 5]
let talents = ["Combat Aware", "Combat Reflexes", "Feint", "Resolute"]
let trappings = ["Mail Coat", "Mail Chausses", "Mail Coif", "Hand Weapon", "Shield"]
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

updateObj.name = this.effect.name + " " + updateObj.name

await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);