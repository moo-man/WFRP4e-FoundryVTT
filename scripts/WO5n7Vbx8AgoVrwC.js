let characteristics = {
    "ws" : 0,
    "bs" : 0,
    "s" : 0,
    "t" : 0,
    "i" : 10,
    "ag" : 0,
    "dex" : 0,
    "int" : 10,
    "wp" : 5,
    "fel" : 5
}
let skills = ["Intuition", "Lore (Local)", "Perception"]
let skillAdvancements = [10, 10, 10]
let talents = []
let trappings = ["Mail Coat", "Mail Chausses", "Mail Coif", "Hand Weapon"]
let items = []

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


await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);