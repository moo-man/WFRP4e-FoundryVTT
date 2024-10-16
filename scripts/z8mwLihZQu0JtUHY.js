
let characteristics = {
    "ws" : 20,
    "bs" : 20,
    "s" : 0,
    "t" : 20,
    "i" : 30,
    "ag" : 0,
    "dex" : 10,
    "int" : 65,
    "wp" : 70,
    "fel" : 20
}
let skills = ["Channelling", "Cool", "Intimidate", "Language (Magick)", "Language (Nehekharan)", "Leadership", "Lore (Magic)", "Perception"]
let skillAdvancements = [20, 30, 25, 30, 20, 20, 30, 20]
let talents = ["Aethyric Attunement", "Arcane Magic", "Hardy", "Instinctive Diction", "Magical Sense", "Menacing", "Menacing", "Petty Magic", "Read/Write", "Second Sight", "War Wizard"]
let trappings = ["Hand Weapon"]
let specialItems = [ 
    {name: "Mouldering Robes", type: "trapping", trappingType: "clothingAccessories" }, 
    {name: "Pouches containing ritual components", type: "trapping", trappingType: "clothingAccessories" }, 
    {name: "Staff", type: "weapon", damage: "SB+2"}, 
    {name: "Dark Magic (Necromancy)", type: "talent"},
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

updateObj.name = updateObj.name += " " + this.effect.name

await this.actor.update(updateObj)
console.log(">>>>>>><", items)
this.actor.createEmbeddedDocuments("Item", items);
