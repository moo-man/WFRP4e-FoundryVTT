let characteristics = {
    "ws" : 0,
    "bs" : 0,
    "s" : 10,
    "t" : 10,
    "i" : 0,
    "ag" : 10,
    "dex" : 0,
    "int" : 0,
    "wp" : 0,
    "fel" : 0
}
let skills = [game.i18n.localize("NAME.ConsumeAlcohol"), game.i18n.localize("NAME.Row"), game.i18n.localize("NAME.Sail"), game.i18n.localize("NAME.Swim")]
let skillAdvancements = [10, 10, 10, 10]
let talents = []
let trappings = []
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