let characteristics = {
    "ws" : 0,
    "bs" : 0,
    "s" : 0,
    "t" : 5,
    "i" : 15,
    "ag" : 0,
    "dex" : 10,
    "int" : 15,
    "wp" : 15,
    "fel" : 0
}
let skills = ["Channelling", "Cool", "Dodge", "Entertain (Storytelling)", "Intuition", "Language (Magick)", "Lore (Magic)", "Perception"]
let skillAdvancements = [5, 15, 10, 10, 15, 10, 10, 20]
let talents = ["Arcane Magic", "Petty Magic", "Second Sight"]
let trappings = ["Hand Weapon", "Quarterstaff", "Ritual Dress incorporating many ingredients and fetishes"]
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
        items.push({name : trapping, type : "trapping", "system.trappingType.value" : "clothingAccessories"})
        //ui.notifications.warn(`Could not find ${trapping}`, {permanent : true})
    }
}

updateObj.name = updateObj.name += " " + this.effect.name

await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);
