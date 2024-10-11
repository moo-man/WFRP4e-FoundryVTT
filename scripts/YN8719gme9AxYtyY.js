let characteristics = {
    "ws" : 10,
    "bs" : 0,
    "s" : 5,
    "t" : 15,
    "i" : 20,
    "ag" : 15,
    "dex" : 20,
    "int" : 35,
    "wp" : 30,
    "fel" : 10
}
let skills = ["Channelling", "Cool", "Dodge", "Entertain (Storytelling)", "Intuition", "Language (Magick)", "Leadership", "Lore (Magic)", "Lore (Theology)", "Perception"]
let skillAdvancements = [20, 25, 20, 25, 30, 25, 15, 20, 10, 30]

let talents = ["Aethyric Attunement", "Instinctive Diction", "Instinctive Diction", "Luck", "Magical Sense", "Menacing", "Arcane Magic", "Petty Magic", "Second Sight", "Sixth Sense"]
let trappings = ["Hand Weapon", "Robes", "Quarterstaff"]
let specialItems = [ 
    {name: "Magic Item", type: "trapping", trappingType: "misc" }, 
]    
let items = [];

let updateObj = this.actor.toObject();

for (let ch in characteristics)
{
    updateObj.system.characteristics[ch].modifier += characteristics[ch];
}

for (let item of specialItems) {
    let newItem
    if (item.type == "weapon") {
        newItem = new ItemWfrp4e({ name: item.name, type: item.type, system: { equipped: true, damage: {value: item.damage}}  })
    } else if (item.type == "trapping") {
        newItem = new ItemWfrp4e({ img: "systems/wfrp4e/icons/blank.png", name: item.name, type: item.type, system: { worn: true, trappingType: { value: item.trappingType}  } } )
    } else {
        newItem = new ItemWfrp4e({ img: "systems/wfrp4e/icons/blank.png", name: item.name, type: item.type  })
    }
    items.push(newItem.toObject())
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

let ride = await Dialog.confirm({title : "Skill", content : "Add Chaos Steed and +20 Ride (Horse)?"})

if (ride)
{
    let skill = await game.wfrp4e.utility.findSkill("Ride (Horse)")
    skill = skill.toObject();
    skill.system.advances.value = 20;
    items = items.concat({name : "Chaos Steed", type: "trapping", "system.trappingType.value" : "misc"}, skill)
}


updateObj.name = updateObj.name += " " + this.effect.name

await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);
