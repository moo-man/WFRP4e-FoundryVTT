let characteristics = {
    "ws" : 10,
    "bs" : 20,
    "s" : 0,
    "t" : 10,
    "i" : 15,
    "ag" : 0,
    "dex" : 0,
    "int" : 40,
    "wp" : 45,
    "fel" : 10
}
let skills = ["Channelling", "Cool", "Intimidate", "Language (Magick)", "Language (Nehekharan)", "Lore (Magic)", "Perception"]
let skillAdvancements = [10, 20, 15, 15, 10, 10, 10]
let talents = ["Arcane Magic", "Hardy", "Menacing", "Petty Magic", "Read/Write", "Second Sight"]
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

let filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "system.lore.value",
        value : "petty"
    }
]

let petty = (await ItemDialog.createFromFilters(filters, 3, "Choose 3 Petty Spells")).map(i => i.toObject());


filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "system.lore.value",
        value : ""
    }
]

let arcane = (await ItemDialog.createFromFilters(filters, 2, "Choose 2 Arcane Spells")).map(i => i.toObject());

filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "name",
        value: /^((?!\().)*$/gm, // Remove all spells with parentheses (all arcane spells spells)
        regex: true
    },
    {
        property : "system.lore.value",
        value : "necromancy"
    }
]

let necromancy = (await ItemDialog.createFromFilters(filters, 1, "Choose 1 Necromancy Spell")).map(i => i.toObject());

arcane.forEach(i => {
    i.img = "modules/wfrp4e-core/icons/spells/necromancy.png";
    i.system.lore.value = "necromancy";
})
let spells = [...petty, ...necromancy, ...arcane];

updateObj.name = updateObj.name += " " + this.effect.name
await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items.concat(spells));
