let characteristics = {
    "ws" : 35,
    "bs" : 10,
    "s" : 25,
    "t" : 30,
    "i" : 30,
    "ag" : 25,
    "dex" : 0,
    "int" : 15,
    "wp" : 35,
    "fel" : 15
}
let skills = ["Cool", "Dodge", "Intimidate", "Intuition", "Language (Battle)", "Leadership", "Lore (Warfare)", "Perception"]
let skillAdvancements = [25, 15, 25, 25, 15, 30, 20, 20]

let talents = ["Combat Aware", "Combat Master", "Combat Reflexes", "Inspiring", "Luck", "Resolute", "Unshakable", "War Leader"]
let trappings = ["Hand Weapon",  "Shield", "Plate Breastplate", "Plate Bracers", "Plate Helm", "Plate Leggings"]
let specialItems = [ 
    {name: "Two Handed Weapon", type: "trapping", trappingType: "clothingAccessories" }, 
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

let filters = [
    {
        property : "type",
        value : "weapon"
    },
    {
        property : "system.weaponGroup.value",
        value : ["twohanded", "polearm"]
    }
]

items = items.concat(await ItemDialog.createFromFilters(filters, 1, "Choose an appropriate Polearm or Two-Handed Weapon"))

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
console.log(">>>>>>><", items)
this.actor.createEmbeddedDocuments("Item", items);
