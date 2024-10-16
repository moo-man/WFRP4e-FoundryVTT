const WFRP4E = {}
CONFIG.ChatMessage.template = "systems/wfrp4e/templates/chat/chat-message.hbs"

WFRP4E.creditOptions = {
    SPLIT: "split",
    EACH: "each",
}

WFRP4E.toTranslate = [
"statusTiers",
"characteristics",
"characteristicsAbbrev",
"characteristicsBonus",
"skillTypes",
"skillGroup",
"talentMax",
"weaponGroups",
"weaponTypes",
"weaponReaches",
"ammunitionGroups",
"itemQualities",
"itemFlaws",
"weaponQualities",
"weaponFlaws",
"armorQualities",
"armorFlaws",
"armorTypes",
"rangeModifiers",
"rangeBands",
"difficultyLabels",
"difficultyNames",
"locations",
"availability",
"trappingTypes",
"trappingCategories",
"actorSizes",
"magicLores",
"magicWind",
"prayerTypes",
"mutationTypes",
"conditions",
"availabilityTable",
"moneyNames",
"hitLocationTables",
"extendedTestCompletion",
"applyScope",
"weaponGroupDescriptions",
"qualityDescriptions",
"flawDescriptions",
"loreEffectDescriptions",
"conditionDescriptions",
"symptoms",
"symptomDescriptions",
"symptomTreatment",
"reachDescription",
"classTrappings",
"transferTypes"
]

// "Trappings" are more than "trapping" type items
WFRP4E.trappingItems = ["trapping", "armour", "weapon", "container", "ammunition", "money"]

CONFIG.controlIcons.defeated = "systems/wfrp4e/icons/defeated.png";

CONFIG.JournalEntry.noteIcons = {
    "Marker": "systems/wfrp4e/icons/buildings/point_of_interest.png",
    "Apothecary": "systems/wfrp4e/icons/buildings/apothecary.png",
    "Beastmen Herd 1": "systems/wfrp4e/icons/buildings/beastmen_camp1.png",
    "Beastmen Herd 2": "systems/wfrp4e/icons/buildings/beastmen_camp2.png",
    "Blacksmith": "systems/wfrp4e/icons/buildings/blacksmith.png",
    "Bretonnian City 1": "systems/wfrp4e/icons/buildings/bret_city1.png",
    "Bretonnian City 2": "systems/wfrp4e/icons/buildings/bret_city2.png",
    "Bretonnian City 3": "systems/wfrp4e/icons/buildings/bret_city3.png",
    "Bretonnian Worship": "systems/wfrp4e/icons/buildings/bretonnia_worship.png",
    "Caste Hill 1": "systems/wfrp4e/icons/buildings/castle_hill1.png",
    "Caste Hill 2": "systems/wfrp4e/icons/buildings/castle_hill2.png",
    "Caste Hill 3": "systems/wfrp4e/icons/buildings/castle_hill3.png",
    "Castle Wall": "systems/wfrp4e/icons/buildings/castle_wall.png",
    "Cave 1": "systems/wfrp4e/icons/buildings/cave1.png",
    "Cave 2": "systems/wfrp4e/icons/buildings/cave2.png",
    "Cave 3": "systems/wfrp4e/icons/buildings/cave3.png",
    "Cemetery": "systems/wfrp4e/icons/buildings/cemetery.png",
    "Chaos Portal": "systems/wfrp4e/icons/buildings/chaos_portal.png",
    "Chaos Worship": "systems/wfrp4e/icons/buildings/chaos_worship.png",
    "Court": "systems/wfrp4e/icons/buildings/court.png",
    "Dwarf Beer": "systems/wfrp4e/icons/buildings/dwarf_beer.png",
    "Dwarf Hold 1": "systems/wfrp4e/icons/buildings/dwarf_hold1.png",
    "Dwarf Hold 2": "systems/wfrp4e/icons/buildings/dwarf_hold2.png",
    "Dwarf Hold 3": "systems/wfrp4e/icons/buildings/dwarf_hold3.png",
    "Empire Barracks": "systems/wfrp4e/icons/buildings/empire_barracks.png",
    "Empire City 1": "systems/wfrp4e/icons/buildings/empire_city1.png",
    "Empire City 2": "systems/wfrp4e/icons/buildings/empire_city2.png",
    "Empire City 3": "systems/wfrp4e/icons/buildings/empire_city3.png",
    "Farm": "systems/wfrp4e/icons/buildings/farms.png",
    "Food 1": "systems/wfrp4e/icons/buildings/food.png",
    "Food 2": "systems/wfrp4e/icons/buildings/food2.png",
    "Guard Post": "systems/wfrp4e/icons/buildings/guards.png",
    "Haunted Hill": "systems/wfrp4e/icons/buildings/haunted_hill.png",
    "Haunted Wood": "systems/wfrp4e/icons/buildings/haunted_wood.png",
    "Inn 1": "systems/wfrp4e/icons/buildings/inn1.png",
    "Inn 2": "systems/wfrp4e/icons/buildings/inn2.png",
    "Kislev City 1": "systems/wfrp4e/icons/buildings/kislev_city1.png",
    "Kislev City 2": "systems/wfrp4e/icons/buildings/kislev_city2.png",
    "Kislev City 3": "systems/wfrp4e/icons/buildings/kislev_city3.png",
    "Lumber": "systems/wfrp4e/icons/buildings/lumber.png",
    "Magic": "systems/wfrp4e/icons/buildings/magic.png",
    "Metal": "systems/wfrp4e/icons/buildings/metal.png",
    "Mountain 1": "systems/wfrp4e/icons/buildings/mountains1.png",
    "Mountain 2": "systems/wfrp4e/icons/buildings/mountains2.png",
    "Orcs": "systems/wfrp4e/icons/buildings/orcs.png",
    "Orc Camp": "systems/wfrp4e/icons/buildings/orc_city.png",
    "Port": "systems/wfrp4e/icons/buildings/port.png",
    "Road": "systems/wfrp4e/icons/buildings/roads.png",
    "Ruins": "systems/wfrp4e/icons/buildings/ruins.png",
    "Scroll": "systems/wfrp4e/icons/buildings/scroll.png",
    "Sigmar": "systems/wfrp4e/icons/buildings/sigmar_worship.png",
    "Stables": "systems/wfrp4e/icons/buildings/stables.png",
    "Standing Stones": "systems/wfrp4e/icons/buildings/standing_stones.png",
    "Swamp": "systems/wfrp4e/icons/buildings/swamp.png",
    "Temple": "systems/wfrp4e/icons/buildings/temple.png",
    "Textile": "systems/wfrp4e/icons/buildings/textile.png",
    "Tower 1": "systems/wfrp4e/icons/buildings/tower1.png",
    "Tower 2": "systems/wfrp4e/icons/buildings/tower2.png",
    "Tower Hill": "systems/wfrp4e/icons/buildings/tower_hill.png",
    "Wizard Tower": "systems/wfrp4e/icons/buildings/wizard_tower.png",
    "Ulric": "systems/wfrp4e/icons/buildings/ulric_worship.png",
    "Village 1": "systems/wfrp4e/icons/buildings/village1.png",
    "Village 2": "systems/wfrp4e/icons/buildings/village2.png",
    "Village 3": "systems/wfrp4e/icons/buildings/village3.png",
    "Wood Elves 1": "systems/wfrp4e/icons/buildings/welves1.png",
    "Wood Elves 2": "systems/wfrp4e/icons/buildings/welves2.png",
    "Wood Elves 3": "systems/wfrp4e/icons/buildings/welves3.png"
}


CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
        pattern : /@Table\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            const a = document.createElement("a")
            a.classList.add("table-click")
            a.dataset.table = match[1]
            a.innerHTML = `<i class="fas fa-list"></i>${(game.wfrp4e.tables.findTable(match[1])?.name && !match[2]) ? game.wfrp4e.tables.findTable(match[1])?.name : match[2]}`
            return a
        }
    },
    {
        pattern : /@Symptom\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            const a = document.createElement("a")
            a.classList.add("symptom-tag")
            a.dataset.symptom = match[1]
            let id = match[1]
            let label = match[2]
            a.innerHTML = `<i class="fas fa-user-injured"></i>${label ? label : id}`
            return a
        }
    },
    {
        pattern : /@Condition\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            const a = document.createElement("a")
            a.classList.add("condition-chat")
            a.dataset.cond = match[1]
            let id = match[1]
            let label = match[2]
            a.innerHTML = `<i class="fas fa-user-injured"></i>${label ? label : id}`
            return a
        }
    },
    {
        pattern : /@Property\[(.+?)](?:{(.+?)})?/gm,
        enricher : (match) => {
            const a = document.createElement("a");
            a.classList.add("property-chat");
            a.dataset.cond = match[1];
            let id = match[1];
            let label = match[2];
            a.innerHTML = `<i class="fas fa-wrench"></i>${label ? label : id}`;
            return a;
        }
    },
    {
        pattern : /@Pay\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            const a = document.createElement("a")
            a.classList.add("pay-link")
            a.dataset.pay = match[1]
            let id = match[1]
            let label = match[2]
            a.innerHTML = `<i class="fas fa-coins"></i>${label ? label : id}`
            return a
        }
    },
    {
        pattern : /@Credit\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            const a = document.createElement("a")
            a.classList.add("credit-link")
            a.dataset.credit = match[1]
            let id = match[1]
            let label = match[2]
            a.innerHTML = `<i class="fas fa-coins"></i>${label ? label : id}`
            return a
        }
    },
    {
        pattern : /@Corruption\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            const a = document.createElement("a")
            a.classList.add("corruption-link")
            a.dataset.strength = match[1]
            let id = match[1]
            let label = match[2]
            a.innerHTML = `<img src="systems/wfrp4e/ui/chaos.svg" height=15px width=15px style="border:none">${label ? label : id}`
            return a
        }
    },
    {
        pattern : /@Fear\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            let values = match[1].split(",")
            const a = document.createElement("a")
            a.classList.add("fear-link")
            a.dataset.value = values[0]
            a.dataset.name = values[1] || ""
            a.innerHTML = `<img src="systems/wfrp4e/ui/fear.svg" height=15px width=15px style="border:none"> ${game.i18n.localize("WFRP4E.ConditionName.Fear")} ${values[0]}`
            return a
        }
    },
    {
        pattern : /@Terror\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            let values = match[1].split(",")
            const a = document.createElement("a")
            a.classList.add("terror-link")
            a.dataset.value = values[0]
            a.dataset.name = values[1] || ""
            a.innerHTML = `<img src="systems/wfrp4e/ui/terror.svg" height=15px width=15px style="border:none"> ${game.i18n.localize("NAME.Terror")} ${values[0]}`
            return a
        }
    },
    {
        pattern : /@Exp\[(.+?)\](?:{(.+?)})?/gm,
        enricher : (match, options) => {
            let values = match[1].split(",")
            const a = document.createElement("a")
            a.classList.add("exp-link")
            a.dataset.amount = values[0]
            a.dataset.reason= values[1] || ""
            let label = match[2]
            a.innerHTML = `<i class="fas fa-plus"></i> ${ label ? label : (values[1] || values[0])}</a>`
            return a
        }
    },
])

// Status Tiers
WFRP4E.statusTiers = {
    "g": "TIER.Gold",
    "s": "TIER.Silver",
    "b": "TIER.Brass"
};

// Characteristic Names
WFRP4E.characteristics = {
    "ws": "CHAR.WS",
    "bs": "CHAR.BS",
    "s": "CHAR.S",
    "t": "CHAR.T",
    "i": "CHAR.I",
    "ag": "CHAR.Ag",
    "dex": "CHAR.Dex",
    "int": "CHAR.Int",
    "wp": "CHAR.WP",
    "fel": "CHAR.Fel"
};

// Characteristic Abbreviations
WFRP4E.characteristicsAbbrev = {
    "ws": "CHARAbbrev.WS",
    "bs": "CHARAbbrev.BS",
    "s": "CHARAbbrev.S",
    "t": "CHARAbbrev.T",
    "i": "CHARAbbrev.I",
    "ag": "CHARAbbrev.Ag",
    "dex": "CHARAbbrev.Dex",
    "int": "CHARAbbrev.Int",
    "wp": "CHARAbbrev.WP",
    "fel": "CHARAbbrev.Fel"
};

// Characteristic Abbreviations
WFRP4E.characteristicsBonus = {
    "ws": "CHARBonus.WS",
    "bs": "CHARBonus.BS",
    "s": "CHARBonus.S",
    "t": "CHARBonus.T",
    "i": "CHARBonus.I",
    "ag": "CHARBonus.Ag",
    "dex": "CHARBonus.Dex",
    "int": "CHARBonus.Int",
    "wp": "CHARBonus.WP",
    "fel": "CHARBonus.Fel"
};

WFRP4E.skillTypes = {
    "bsc": "Basic",
    "adv": "Advanced"
};

WFRP4E.xpCost = {
    "characteristic": [25, 30, 40, 50, 70, 90, 120, 150, 190, 230, 280, 330, 390, 450, 520],
    "skill": [10, 15, 20, 30, 40, 60, 80, 110, 140, 180, 220, 270, 320, 380, 440]
}

WFRP4E.skillGroup = {
    "isSpec": "ITEM.IsSpec",
    "noSpec": "ITEM.NoSpec"
};

WFRP4E.talentMax = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "none": "None",
    "ws": "CHARBonus.WS",
    "bs": "CHARBonus.BS",
    "s": "CHARBonus.S",
    "t": "CHARBonus.T",
    "i": "CHARBonus.I",
    "ag": "CHARBonus.Ag",
    "dex": "CHARBonus.Dex",
    "int": "CHARBonus.Int",
    "wp": "CHARBonus.WP",
    "fel": "CHARBonus.Fel"
}


// Weapon Groups
WFRP4E.weaponGroups = {
    "basic": "SPEC.Basic",
    "cavalry": "SPEC.Cavalry",
    "fencing": "SPEC.Fencing",
    "brawling": "SPEC.Brawling",
    "flail": "SPEC.Flail",
    "parry": "SPEC.Parry",
    "polearm": "SPEC.Polearm",
    "twohanded": "SPEC.TwoHanded",
    "blackpowder": "SPEC.Blackpowder",
    "bow": "SPEC.Bow",
    "crossbow": "SPEC.Crossbow",
    "entangling": "SPEC.Entangling",
    "engineering": "SPEC.Engineering",
    "explosives": "SPEC.Explosives",
    "sling": "SPEC.Sling",
    "throwing": "SPEC.Throwing",
    "vehicle": "SPEC.Vehicle",
};

// Given a group, what's the primary type, melee or ranged
WFRP4E.groupToType = {
    "basic": "melee",
    "cavalry": "melee",
    "fencing": "melee",
    "brawling": "melee",
    "flail": "melee",
    "parry": "melee",
    "polearm": "melee",
    "twohanded": "melee",
    "blackpowder": "ranged",
    "bow": "ranged",
    "crossbow": "ranged",
    "entangling": "ranged",
    "engineering": "ranged",
    "explosives": "ranged",
    "sling": "ranged",
    "throwing": "ranged",
    "vehicle" : "ranged"
};

WFRP4E.weaponTypes = {
    "melee": "Melee",
    "ranged": "Ranged"
}

// Weapon Reach
WFRP4E.weaponReaches = {
    "personal": "WFRP4E.Reach.Personal",
    "vshort": "WFRP4E.Reach.VShort",
    "short": "WFRP4E.Reach.Short",
    "average": "WFRP4E.Reach.Average",
    "long": "WFRP4E.Reach.Long",
    "vLong": "WFRP4E.Reach.VLong",
    "massive": "WFRP4E.Reach.Massive",
}

// Ammo Groups
WFRP4E.ammunitionGroups = {
    "BPandEng": "WFRP4E.BPandEng",
    "bow": "WFRP4E.Bow",
    "crossbow": "WFRP4E.Crossbow",
    "sling": "WFRP4E.Sling",
    "vehicle": "WFRP4E.Vehicle",
    "throwing": "SPEC.Throwing",
    "entangling": "SPEC.Entangling",
};

// Item Qualities
WFRP4E.itemQualities = {
    "durable": "PROPERTY.Durable",
    "fine": "PROPERTY.Fine",
    "lightweight": "PROPERTY.Lightweight",
    "practical": "PROPERTY.Practical",
};

// Item Flaws
WFRP4E.itemFlaws = {
    "ugly": "PROPERTY.Ugly",
    "shoddy": "PROPERTY.Shoddy",
    "unreliable": "PROPERTY.Unreliable",
    "bulky": "PROPERTY.Bulky",
}


// Weapon Qualities
WFRP4E.weaponQualities = {
    "accurate": "PROPERTY.Accurate",
    "blackpowder": "PROPERTY.Blackpowder",
    "blast": "PROPERTY.Blast",
    "damaging": "PROPERTY.Damaging",
    "defensive": "PROPERTY.Defensive",
    "distract": "PROPERTY.Distract",
    "entangle": "PROPERTY.Entangle",
    "fast": "PROPERTY.Fast",
    "hack": "PROPERTY.Hack",
    "impact": "PROPERTY.Impact",
    "impale": "PROPERTY.Impale",
    "magical": "PROPERTY.Magical",
    "penetrating": "PROPERTY.Penetrating",
    "pistol": "PROPERTY.Pistol",
    "precise": "PROPERTY.Precise",
    "pummel": "PROPERTY.Pummel",
    "repeater": "PROPERTY.Repeater",
    "shield": "PROPERTY.Shield",
    "trapblade": "PROPERTY.TrapBlade",
    "unbreakable": "PROPERTY.Unbreakable",
    "wrap": "PROPERTY.Wrap"
};

// Weapon Flaws
WFRP4E.weaponFlaws = {
    "dangerous": "PROPERTY.Dangerous",
    "imprecise": "PROPERTY.Imprecise",
    "reload": "PROPERTY.Reload",
    "slow": "PROPERTY.Slow",
    "tiring": "PROPERTY.Tiring",
    "undamaging": "PROPERTY.Undamaging"
};

// Armor Qualities
WFRP4E.armorQualities = {
    "flexible": "PROPERTY.Flexible",
    "impenetrable": "PROPERTY.Impenetrable",
    "magical": "PROPERTY.Magical",
};

// Armor Flaws
WFRP4E.armorFlaws = {
    "partial": "PROPERTY.Partial",
    "weakpoints": "PROPERTY.Weakpoints",
};

WFRP4E.propertyHasValue = {
    "durable": true,
    "fine": true,
    "lightweight": false,
    "practical": false,
    "ugly": false,
    "shoddy": false,
    "unreliable": false,
    "bulky": false,
    "accurate": false,
    "blackpowder": false,
    "blast": true,
    "damaging": false,
    "defensive": false,
    "distract": false,
    "entangle": false,
    "fast": false,
    "hack": false,
    "impact": false,
    "impale": false,
    "magical" : false,
    "penetrating": false,
    "pistol": false,
    "precise": false,
    "pummel": false,
    "repeater": true,
    "shield": true,
    "trapblade": false,
    "unbreakable": false,
    "wrap": false,
    "dangerous": false,
    "imprecise": false,
    "reload": true,
    "slow": false,
    "tiring": false,
    "undamaging": false,
    "flexible": false,
    "impenetrable": false,
    "partial": false,
    "weakpoints": false
}

// Equipment Types
WFRP4E.armorTypes = {
    "softLeather": "WFRP4E.ArmourType.SLeather",
    "boiledLeather": "WFRP4E.ArmourType.BLeather",
    "mail": "WFRP4E.ArmourType.Mail",
    "plate": "WFRP4E.ArmourType.Plate",
    "other": "WFRP4E.ArmourType.Other",
    "otherMetal": "WFRP4E.ArmourType.OtherMetal"
};

// Range Test Modifiers
WFRP4E.rangeModifiers = {
    "Point Blank": "easy",
    "Short Range": "average",
    "Normal": "challenging",
    "Long Range": "difficult",
    "Extreme": "vhard",
}

// Ranges
WFRP4E.rangeBands = {
    "pb": "Point Blank",
    "short": "Short Range",
    "normal": "Normal",
    "long": "Long Range",
    "extreme": "Extreme",
}

// Difficulty Modifiers
WFRP4E.difficultyModifiers = {
    "veasy": 60,
    "easy": 40,
    "average": 20,
    "challenging": 0,
    "difficult": -10,
    "hard": -20,
    "vhard": -30
}

// Difficulty Labels
WFRP4E.difficultyLabels = {

    "veasy": "DIFFICULTY.VEasy",
    "easy": "DIFFICULTY.Easy",
    "average": "DIFFICULTY.Average",
    "challenging": "DIFFICULTY.Challenging",
    "difficult": "DIFFICULTY.Difficult",
    "hard": "DIFFICULTY.Hard",
    "vhard": "DIFFICULTY.VHard"
}

WFRP4E.difficultyNames = {

    "veasy": "DIFFICULTYNAME.VEasy",
    "easy": "DIFFICULTYNAME.Easy",
    "average": "DIFFICULTYNAME.Average",
    "challenging": "DIFFICULTYNAME.Challenging",
    "difficult": "DIFFICULTYNAME.Difficult",
    "hard": "DIFFICULTYNAME.Hard",
    "vhard": "DIFFICULTYNAME.VHard"
};

WFRP4E.locations = {
    "head": "WFRP4E.Locations.head",
    "body": "WFRP4E.Locations.body",
    "rArm": "WFRP4E.Locations.rArm",
    "lArm": "WFRP4E.Locations.lArm",
    "rLeg": "WFRP4E.Locations.rLeg",
    "lLeg": "WFRP4E.Locations.lLeg",
}

// Trapping Availability
WFRP4E.availability = {
    "None": "-",
    "common": "WFRP4E.Availability.Common",
    "scarce": "WFRP4E.Availability.Scarce",
    "rare": "WFRP4E.Availability.Rare",
    "exotic": "WFRP4E.Availability.Exotic",
    "special": "WFRP4E.Availability.Special",
}


// Trapping Types
WFRP4E.trappingTypes = {
    "clothingAccessories": "WFRP4E.TrappingType.ClothingAccessories",
    "foodAndDrink": "WFRP4E.TrappingType.FoodDrink",
    "toolsAndKits": "WFRP4E.TrappingType.ToolsKits",
    "booksAndDocuments": "WFRP4E.TrappingType.BooksDocuments",
    "tradeTools": "WFRP4E.TrappingType.TradeTools", // Unused - combined with tools and kits
    "drugsPoisonsHerbsDraughts": "WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts",
    "ingredient": "WFRP4E.TrappingType.Ingredient",
    "misc": "WFRP4E.TrappingType.Misc",
};

// These categories are used to label items in containers (Trapping tab)
WFRP4E.trappingCategories = {
    "weapon": "WFRP4E.TrappingType.Weapon",
    "armour": "WFRP4E.TrappingType.Armour",
    "money": "WFRP4E.TrappingType.Money",
    "ammunition": "WFRP4E.TrappingType.Ammunition",
    "container": "WFRP4E.TrappingType.Container",
    "clothingAccessories": "WFRP4E.TrappingType.ClothingAccessories",
    "foodAndDrink": "WFRP4E.TrappingType.FoodDrink",
    "toolsAndKits": "WFRP4E.TrappingType.ToolsKits",
    "booksAndDocuments": "WFRP4E.TrappingType.BooksDocuments",
    "tradeTools": "WFRP4E.TrappingType.TradeTools",
    "drugsPoisonsHerbsDraughts": "WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts",
    "ingredient": "WFRP4E.TrappingType.Ingredient",
    "misc": "WFRP4E.TrappingType.Misc",
};

// Creature Sizes
WFRP4E.actorSizes = {
    "tiny": "SPEC.Tiny",
    "ltl": "SPEC.Little",
    "sml": "SPEC.Small",
    "avg": "SPEC.Average",
    "lrg": "SPEC.Large",
    "enor": "SPEC.Enormous",
    "mnst": "SPEC.Monstrous"
};

WFRP4E.vehicleTypes = {
    "water" : "Water",
    "land" : "Land",
    "air" : "Air"
}

WFRP4E.crewBulk = {
    tiny : {
        crew : 0,
        encumbrance : 0
    },
    ltl : {
        crew : 0.25,
        encumbrance : 1
    },
    sml : {
        crew : 0.5,
        encumbrance : 3
    },
    avg : {
        crew : 1,
        encumbrance : 6
    },
    lrg : {
        crew : 3,
        encumbrance : 18
    },
    enor : {
        crew : 9,
        encumbrance : 54
    },
    mnst : {
        crew : 27,
        encumbrance : 162
    }
}

WFRP4E.vehicleActorSizeComparison = {
    tiny : {
        tiny : 0,
        ltl : 4,
        sml : 3,
        avg : 2,
        lrg : 1,
        enor :-1 ,
        mnst : -2,
    },
    ltl : {
        tiny : 0,
        ltl : 0,
        sml : 4,
        avg : 3,
        lrg : 2,
        enor :1 ,
        mnst : -1,
    },
    sml : {
        tiny : 0,
        ltl : 0,
        sml : 0,
        avg : 4,
        lrg : 3,
        enor :2 ,
        mnst : 1,
    },
    avg : {
        tiny : 0,
        ltl : 0,
        sml : 0,
        avg : 0,
        lrg : 4,
        enor :3 ,
        mnst : 2,
    },
    lrg : {
        tiny : 0,
        ltl : 0,
        sml : 0,
        avg : 0,
        lrg : 0,
        enor :4 ,
        mnst : 3,
    },
    enor : {
        tiny : 0,
        ltl : 0,
        sml : 0,
        avg : 0,
        lrg : 0,
        enor : 0,
        mnst : 4,
    },
    mnst : {
        tiny : 0,
        ltl : 0,
        sml : 0,
        avg : 0,
        lrg : 0,
        enor : 0,
        mnst : 0,
    }
}

WFRP4E.actorSizeNums = {
    "tiny": 0,
    "ltl": 1,
    "sml": 2,
    "avg": 3,
    "lrg": 4,
    "enor": 5,
    "mnst": 6
};

WFRP4E.tokenSizes = {
    "tiny": 0.3,
    "ltl": 0.5,
    "sml": 0.8,
    "avg": 1,
    "lrg": 2,
    "enor": 3,
    "mnst": 4
};

// Condition Types
WFRP4E.magicLores = {
    "petty": "WFRP4E.MagicLores.petty",
    "beasts": "WFRP4E.MagicLores.beasts",
    "death": "WFRP4E.MagicLores.death",
    "fire": "WFRP4E.MagicLores.fire",
    "heavens": "WFRP4E.MagicLores.heavens",
    "metal": "WFRP4E.MagicLores.metal",
    "life": "WFRP4E.MagicLores.life",
    "light": "WFRP4E.MagicLores.light",
    "shadow": "WFRP4E.MagicLores.shadow",
    "hedgecraft": "WFRP4E.MagicLores.hedgecraft",
    "witchcraft": "WFRP4E.MagicLores.witchcraft",
    "daemonology": "WFRP4E.MagicLores.daemonology",
    "necromancy": "WFRP4E.MagicLores.necromancy",
    "undivided" : "WFRP4E.MagicLores.undivided",
    "nurgle": "WFRP4E.MagicLores.nurgle",
    "slaanesh": "WFRP4E.MagicLores.slaanesh",
    "tzeentch": "WFRP4E.MagicLores.tzeentch",
};

// Given a Lore, what is the Wind
WFRP4E.magicWind = {
    "petty": "WFRP4E.MagicWind.petty",
    "beasts": "WFRP4E.MagicWind.beasts",
    "death": "WFRP4E.MagicWind.death",
    "fire": "WFRP4E.MagicWind.fire",
    "heavens": "WFRP4E.MagicWind.heavens",
    "metal": "WFRP4E.MagicWind.metal",
    "life": "WFRP4E.MagicWind.life",
    "light": "WFRP4E.MagicWind.light",
    "shadow": "WFRP4E.MagicWind.shadow",
    "hedgecraft": "WFRP4E.MagicWind.hedgecraft",
    "witchcraft": "WFRP4E.MagicWind.witchcraft",
    "daemonology": "WFRP4E.MagicWind.daemonology",
    "necromancy": "WFRP4E.MagicWind.necromancy",
    "undivided": "WFRP4E.MagicWind.undivided",
    "nurgle": "WFRP4E.MagicWind.nurgle",
    "slaanesh": "WFRP4E.MagicWind.slaanesh",
    "tzeentch": "WFRP4E.MagicWind.tzeentch",
};



// Types of prayers
WFRP4E.prayerTypes = {
    "blessing": "WFRP4E.prayerTypes.blessing",
    "miracle": "WFRP4E.prayerTypes.miracle"
}

WFRP4E.mutationTypes = {
    "physical": "WFRP4E.mutationTypes.physical",
    "mental": "WFRP4E.mutationTypes.mental"
}


WFRP4E.conditions = {
    "ablaze": "WFRP4E.ConditionName.Ablaze",
    "bleeding": "WFRP4E.ConditionName.Bleeding",
    "blinded": "WFRP4E.ConditionName.Blinded",
    "broken": "WFRP4E.ConditionName.Broken",
    "deafened": "WFRP4E.ConditionName.Deafened",
    "entangled": "WFRP4E.ConditionName.Entangled",
    "fatigued": "WFRP4E.ConditionName.Fatigued",
    "poisoned": "WFRP4E.ConditionName.Poisoned",
    "prone": "WFRP4E.ConditionName.Prone",
    "stunned": "WFRP4E.ConditionName.Stunned",
    "surprised": "WFRP4E.ConditionName.Surprised",
    "unconscious": "WFRP4E.ConditionName.Unconscious",
    "grappling": "WFRP4E.ConditionName.Grappling",
    "engaged": "WFRP4E.ConditionName.Engaged",
    "defeated": "WFRP4E.ConditionName.Defeated"
}


WFRP4E.earningValues = {
    "b": "2d10",
    "s": "1d10",
    "g": "1",
}

WFRP4E.randomExp = {
    speciesRand: 20,
    careerRand: 50,
    careerReroll: 25,
    statsRand: 50,
    statsReorder: 25
}

WFRP4E.reachNum = {
    "personal": 1,
    "vshort": 2,
    "short": 3,
    "average": 4,
    "long": 5,
    "vLong": 6,
    "massive": 7,
}

WFRP4E.traitBonuses = {
    "big": {
        "s": 10,
        "t": 10,
        "ag": -5
    },
    "brute": {
        "m": -1,
        "t": 10,
        "s": 10,
        "ag": -10
    },
    "clever": {
        "int": 20,
        "i": 10
    },
    "cunning": {
        "int": 10,
        "fel": 10,
        "i": 10
    },
    "elite": {
        "ws": 20,
        "bs": 20,
        "wp": 20
    },
    "fast": {
        "ag": 10,
        "m": 1
    },
    "leader": {
        "fel": 10,
        "wp": 10
    },
    "tough": {
        "t": 10,
        "wp": 10
    },
    "swarm": {
        "ws": 10
    }
}

WFRP4E.talentBonuses = {
    "savvy": "int",
    "suave": "fel",
    "marksman": "bs",
    "very strong": "s",
    "sharp": "i",
    "lightning reflexes": "ag",
    "coolheaded": "wp",
    "very resilient": "t",
    "nimble fingered": "dex",
    "warrior born": "ws"
}

WFRP4E.corruptionTables = ["mutatephys", "mutatemental"]

WFRP4E.DAMAGE_TYPE = {
    NORMAL: 0,
    IGNORE_AP: 1,
    IGNORE_TB: 2,
    IGNORE_ALL: 3
}

WFRP4E.PSEUDO_ENTITIES = [
    "Table",
    "Condition",
    "Symptom",
    "Roll",
    "Pay",
    "Credit",
    "Corruption",
    "Fear",
    "Terror",
    "Exp"
]

WFRP4E.availabilityTable = {
    "MARKET.Village": {
        "WFRP4E.Availability.Common": {
            test: 100,
            stock: '2'
        },
        "WFRP4E.Availability.Scarce": {
            test: 30,
            stock: '1'
        },
        "WFRP4E.Availability.Rare": {
            test: 15,
            stock: '1'
        },
        "WFRP4E.Availability.Exotic": {
            test: 0,
            stock: '0'
        }
    },
    "MARKET.Town": {
        "WFRP4E.Availability.Common": {
            test: 100,
            stock: '2d10'
        },
        "WFRP4E.Availability.Scarce": {
            test: 60,
            stock: '1d10'
        },
        "WFRP4E.Availability.Rare": {
            test: 30,
            stock: '1d5'
        },
        "WFRP4E.Availability.Exotic": {
            test: 0,
            stock: '0'
        }
    },
    "MARKET.City": {
        "WFRP4E.Availability.Common": {
            test: 100,
            stock: '∞'
        },
        "WFRP4E.Availability.Scarce": {
            test: 90,
            stock: '∞'
        },
        "WFRP4E.Availability.Rare": {
            test: 45,
            stock: '∞'
        },
        "WFRP4E.Availability.Exotic": {
            test: 0,
            stock: '0'
        }
    }
}

WFRP4E.overCastTable = {
  range: [
    {cost: 1, value: 2},
    {cost: 4, value: 3},
    {cost: 16, value: 4}],
  target: [
    {cost: 1, value: 1},
    {cost: 4, value: 2},
    {cost: 16, value: 3}],
  AoE: [
    {cost: 3, value: 2},
    {cost: 18, value: 3}],
  duration: [
    {cost: 2, value: 2},
    {cost: 6, value: 3}],
  damage: [
    {cost: 1, value: 1},
    {cost: 1, value: 2},
    {cost: 1, value: 3},
    {cost: 2, value: 4},
    {cost: 3, value: 5},
    {cost: 5, value: 6},
    {cost: 8, value: 7}]
}

WFRP4E.species = {};
WFRP4E.subspecies = {};
WFRP4E.speciesCharacteristics = {}
WFRP4E.speciesSkills = {}
WFRP4E.speciesTalents = {}
WFRP4E.speciesTraits = {}
WFRP4E.speciesRandomTalents = {}
WFRP4E.speciesTalentReplacement = {}
WFRP4E.speciesMovement = {}
WFRP4E.speciesFate = {}
WFRP4E.speciesRes = {}
WFRP4E.speciesExtra = {}
WFRP4E.speciesAge = {}
WFRP4E.speciesHeight = {}
WFRP4E.speciesCareerReplacements = {}
WFRP4E.extraSpecies = [];
WFRP4E.classTrappings = {}
WFRP4E.weaponGroupDescriptions = {};
WFRP4E.reachDescription = {}
WFRP4E.qualityDescriptions = {};
WFRP4E.flawDescriptions = {};
WFRP4E.loreEffectDescriptions = {};
WFRP4E.loreEffects = {};
WFRP4E.conditionDescriptions = {}
WFRP4E.symptoms = {}
WFRP4E.symptomDescriptions = {}
WFRP4E.symptomTreatment = {}
WFRP4E.modTypes = {}
WFRP4E.symptomEffects = {}
WFRP4E.effectScripts = {};
WFRP4E.propertyEffects = {};
WFRP4E.godBlessings = {}

WFRP4E.effectKeysTemplate = "systems/wfrp4e/templates/apps/effect-key-options.hbs",
WFRP4E.avoidTestTemplate = "systems/wfrp4e/templates/apps/effect-avoid-test.hbs",
WFRP4E.logFormat = [`%cWFRP4e` + `%c | @MESSAGE`, "color: gold", "color: unset"],
WFRP4E.rollClasses = {},

WFRP4E.transferTypes = {
    document : "WH.TransferType.Document",
    damage : "WH.TransferType.Damage",
    target : "WH.TransferType.Target",
    area : "WH.TransferType.Area",
    aura : "WH.TransferType.Aura",
    crew : "WH.TransferType.Crew",
    other : "WH.TransferType.Other"
},

WFRP4E.premiumModules = {
    "wfrp4e" : "WFRP4e System",
    "wfrp4e-core" : "Core Rulebook",
    "wfrp4e-starter-set" : "Starter Set",
    "wfrp4e-rnhd" : "Rough Nights & Hard Days",
    "wfrp4e-eis" : "Enemy In Shadows",
    "wfrp4e-ua1" : "Ubersreik Adventures I",
    "wfrp4e-dotr" : "Death on the Reik",
    "wfrp4e-middenheim" : "Middenheim: City of the White Wolf",
    "wfrp4e-archives1" : "Archives of the Empire: Vol I.",
    "wfrp4e-pbtt" : "Power Behind the Throne",
    "wfrp4e-altdorf" : "Altdorf: Crown of the Empire",
    "wfrp4e-ua2" : "Ubersreik Adventures II",
    "wfrp4e-owb1" : "Old World Bundle I",
    "wfrp4e-horned-rat" : "The Horned Rat",
    "wfrp4e-empire-ruins" : "Empire in Ruins",
    "wfrp4e-archives2" : "Archives of the Empire: Vol II.",
    "wfrp4e-up-in-arms" : "Up In Arms",
    "wfrp4e-wom" : "Winds of Magic",
    "wfrp4e-zoo" : "Imperial Zoo",
    "wfrp4e-salzenmund" : "Salzenmund: City of Salt and Silver",
    "wfrp4e-owb2" : "Old World Bundle II",
    "wfrp4e-soc" : "Sea of Claws",
    "wfrp4e-lustria" : "Lustria",
    "wfrp4e-archives3" : "Archives of the Empire: Vol III.",
}

WFRP4E.trade = { 
    gazetteer : [],
    settlementRating : {
        "hamlet": { popmax: 200,
          size_rating: 1 },
      
        "village": {
          popmax: 1500,
          size_rating: 2
        },
      
        "town": { popmax: 10000,
          size_rating: 3 },
      
        "city": { popmax: 100000000,
          size_rating: 4 }
      },
      wealthAvailability : [
        { wealth: 0,
          offered: -1.0 },
        
          { wealth: 1,
          offered: -0.5 },
        
        { wealth: 2,
          offered: -0.2 },
        
        { wealth: 3,
          offered: 0 },
        
        { wealth: 4,
          offered: 0.05 },
        
        { wealth: 5,
          offered: 0.1 }
        ],
        cargoTypes : {},
        seasons : {},
        cargoTable : {},
        wineBrandyPrice : [],
        qualities : {}
}

// This defines the standard money used. 
// "moneyNames" is what currency name to look for when creating a character 
// The money keys are used for parsing input (like commands)
// Override these values if you wish to have a campaign in a different setting
WFRP4E.moneyNames = {
    "gc" : "NAME.GC",
    "ss" : "NAME.SS",
    "bp" : "NAME.BP"
}

WFRP4E.moneyValues = {
    "gc" : 240,
    "ss" : 20,
    "bp" : 1
}

WFRP4E.hitLocationTables = {
    "hitloc": "WFRP4E.hitLocationTables.hitloc",
    "snake": "WFRP4E.hitLocationTables.snake",
    "spider": "WFRP4E.hitLocationTables.spider"
}

WFRP4E.extendedTestCompletion = {
    none: "ExtendedTest.None",
    reset: "ExtendedTest.Reset",
    remove: "ExtendedTest.Remove"
}

// For modules to add to these, they need to be merged
WFRP4E.systemItems = {};
WFRP4E.systemEffects = {}
WFRP4E.vehicleSystemEffects = {}
WFRP4E.groupAdvantageActions = [];

WFRP4E.PrepareSystemItems = function() {

    this.systemItems = foundry.utils.mergeObject(this.systemItems, {
        reload : {
            type: "extendedTest",
            name: "",
            system: {
                SL: {
                },
                test: {
                    value: ""
                },
                completion: {
                    value: "remove"
                }
            },
            flags: {
                wfrp4e: {
                    reloading: ""
                }
            }
        },
        improv : {
            name: game.i18n.localize("NAME.Improvised"),
            type: "weapon",
            effects : [],
            system: {
                damage: { value: "SB + 1" },
                reach: { value: "personal" },
                weaponGroup: { value: "basic" },
                twohanded: { value: false },
                qualities: { value: [] },
                flaws: { value: [{name : "undamaging"}] },
                special: { value: "" },
                range: { value: "" },
                ammunitionGroup: { value: "" },
                offhand: { value: false },
            }
        },
        stomp : {
            name: game.i18n.localize("NAME.Stomp"),
            type: "trait",
            effects : [],
            system: {
                specification: { value: 0 },
                rollable: { value: true, rollCharacteristic: "ws", bonusCharacteristic: "s", defaultDifficulty: "challenging", damage : true, SL: true, skill : game.i18n.localize("NAME.MeleeBrawling") },
            }
        },
        unarmed : {
            name: game.i18n.localize("NAME.Unarmed"),
            type: "weapon",
            effects : [],
            system: {
                damage: { value: "SB + 0" },
                reach: { value: "personal" },
                weaponGroup: { value: "brawling" },
                twohanded: { value: false },
                qualities: { value: [] },
                flaws: { value: [{name : "undamaging"}] },
                special: { value: "" },
                range: { value: "" },
                ammunitionGroup: { value: "" },
                offhand: { value: false },
            }
        },

        fear : {
            name : game.i18n.localize("NAME.FearExtendedTest"),
            type : "extendedTest",
            system : {
                completion:{value: 'remove'},
                description:{type: 'String', label: 'Description', value: ''},
                failingDecreases:{value: true},
                gmdescription:{type: 'String', label: 'Description', value: ''},
                hide: { test: false, progress: false },
                negativePossible: { value: false },
                SL: { current: 0, target: 1 },
                test: { value: game.i18n.localize("NAME.Cool") }
            },
            flags : {
                wfrp4e : {
                    fear : true
                }
            },
            effects:
                [{
                    name: game.i18n.localize("NAME.Fear"),
                    img: "systems/wfrp4e/icons/conditions/fear.png",
                    statuses : ["fear"],
                    system: {
                            transferData : {},
                            scriptData : [
                                {
                                    label : "@effect.flags.wfrp4e.dialogTitle",
                                    trigger : "dialog",
                                    script : `args.fields.slBonus -= 1`,
                                    options : {
                                        hideScript : "",
                                        activateScript : `return args.data.targets[0]?.name == this.item.flags.wfrp4e?.fearName`
                                    }
                                },
                                {
                                    label : "@effect.name",
                                    trigger : "immediate",
                                    script : `
                                    let name = this.item?.flags?.wfrp4e?.fearName
                                    this.effect.updateSource({"flags.wfrp4e.dialogTitle" : (name ? game.i18n.format("EFFECT.AffectTheSourceOfFearName", {name}) : game.i18n.format("EFFECT.AffectTheSourceOfFear"))})
                                    if (name)
                                    {
                                        this.item.updateSource({name : this.item.name + " (" + name + ")" })
                                    }
                                    `
                                }
                            ]
                        }
                }]

        },

        terror: {
            name: game.i18n.localize("NAME.Terror"),
            img: "systems/wfrp4e/icons/conditions/terror.png",
            system: {
                transferData : {},
                scriptData : [
                    {
                        label : "@effect.name",
                        trigger : "immediate",
                        script : `
                        let terror = this.effect.flags.wfrp4e.terrorValue;
                        let skillName = game.i18n.localize("NAME.Cool");
                        let test = await args.actor.setupSkill(skillName, {terror: true, appendTitle : " - Terror", skipTargets: true});
                        await test.roll();
                        await this.actor.applyFear(terror, name)
                        if (test.failed)
                        {
                            if (test.result.SL < 0)
                                terror += Math.abs(test.result.SL)

                            await this.actor.addCondition("broken", terror)
                        }
                        `
                    }
                ]
            },
        }
    })


    this.systemEffects = foundry.utils.mergeObject(this.systemEffects, {
        "fear": {
            name: game.i18n.localize("NAME.Fear"),
            img: "systems/wfrp4e/icons/conditions/fear.png",
            statuses: ["fear"],
            flags: {
                wfrp4e: {
                    transferData: {},
                    scriptData: [
                        {
                            label: "@effect.flags.wfrp4e.dialogTitle",
                            trigger: "dialog",
                            script: `args.fields.slBonus -= 1`,
                            options: {
                                    hideScript: "",
                                    activateScript: `return args.data.targets[0]?.name == this.item.flags.wfrp4e?.fearName`
                            }
                        },
                        {
                            label: "@effect.name",
                            trigger: "immediate",
                            script: `
                            let name = this.item?.flags?.wfrp4e?.fearName
                            this.effect.updateSource({"flags.wfrp4e.dialogTitle" : (name ? game.i18n.format("EFFECT.AffectTheSourceOfFearName", {name}) : game.i18n.format("EFFECT.AffectTheSourceOfFear"))})
                            if (name)
                            {
                                this.item.updateSource({name : this.item.name + " (" + name + ")" })
                            }
                            `
                        }
                    ]
                }
            }
        },
        "enc1": {
            name: game.i18n.localize("EFFECT.Encumbrance") + " 1",
            img: "systems/wfrp4e/icons/effects/enc1.png",
            statuses: ["enc1"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "prePrepareData",
                        script: `
                            args.actor.characteristics.ag.modifier -= 10;

                            if (args.actor.details.move.value > 3)
                            {
                                args.actor.details.move.value -= 1;
                                if (args.actor.details.move.value < 3)
                                    args.actor.details.move.value = 3
                            }
                            `
                    }
                ]
            }
        },
        "enc2": {
            name: game.i18n.localize("EFFECT.Encumbrance") + " 2",
            img: "systems/wfrp4e/icons/effects/enc2.png",
            statuses: ["enc2"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "prePrepareData",
                        script: `
                            args.actor.characteristics.ag.modifier -= 20;
                            if (args.actor.details.move.value > 2)
                            {
                                args.actor.details.move.value -= 2;
                                if (args.actor.details.move.value < 2)
                                    args.actor.details.move.value = 2
                            }
                            `
                    }
                ]
            }
        },
        "enc3": {
            name: game.i18n.localize("EFFECT.Encumbrance") + " 3",
            img: "systems/wfrp4e/icons/effects/enc3.png",
            statuses: ["enc3"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "prePrepareData",
                        script: "args.actor.details.move.value = 0;"
                    }
                ]
            }
        },
        "cold1": {
            name: game.i18n.localize("EFFECT.ColdExposure") + " 1",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["cold1"],
            changes: [
                { key: "system.characteristics.bs.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ag.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.dex.modifier", mode: 2, value: -10 },
            ]
        },
        "cold2": {
            name: game.i18n.localize("EFFECT.ColdExposure") + " 2",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["cold2"],
            changes: [
                { key: "system.characteristics.bs.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ag.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ws.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.s.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.i.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.dex.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.int.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.wp.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.fel.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1 },
            ]
        },
        "cold3": {
            name: game.i18n.localize("EFFECT.ColdExposure") + " 3",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["cold3"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "manual",
                        script: `
                            let tb = this.actor.characteristics.t.bonus
                            let damage = (await new Roll("1d10").roll()).total
                            damage -= tb
                            if (damage <= 0) damage = 1
                            if (this.actor.status.wounds.value <= damage) {
                                await this.actor.addCondition("unconscious")
                            }
                            this.actor.modifyWounds(-damage)
                            ui.notifications.notify(game.i18n.format("TookDamage", { damage: damage }))
                            `
                    }
                ]
            }
        },
        "heat1": {
            name: game.i18n.localize("EFFECT.HeatExposure") + " 1",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["heat1"],
            changes: [
                { key: "system.characteristics.int.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.wp.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1 },
            ]
        },
        "heat2": {
            name: game.i18n.localize("EFFECT.HeatExposure") + " 2",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["heat2"],
            changes: [
                { key: "system.characteristics.bs.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ag.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ws.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.s.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.i.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.dex.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.int.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.wp.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.fel.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1 },
            ]
        },
        "heat3": {
            name: game.i18n.localize("EFFECT.HeatExposure") + " 3",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["heat3"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "manual",
                        script: `
                            let tb = this.actor.characteristics.t.bonus
                            let damage = (await new Roll("1d10").roll()).total
                            damage -= tb
                            if (damage <= 0) {
                                damage = 1
                            }
                            this.actor.modifyWounds(-damage)
                            ui.notifications.notify(game.i18n.format("TookDamage", { damage: damage }))
                            `
                    }
                ]
            }
        },
        "thirst1": {
            name: game.i18n.localize("EFFECT.Thirst") + " 1",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["thirst1"],
            changes: [
                { key: "system.characteristics.int.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.wp.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.fel.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1 },
            ]
        },
        "thirst2": {
            name: game.i18n.localize("EFFECT.Thirst") + " 2+",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["thirst2"],
            changes: [
                { key: "system.characteristics.bs.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ag.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ws.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.s.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.i.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.int.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.dex.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.wp.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.fel.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1 },
            ],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "manual",
                        script: `
                            let tb = this.actor.characteristics.t.bonus
                            let damage = (await new Roll("1d10").roll()).total
                            damage -= tb
                            if (damage <= 0) {
                                damage = 1
                            }
                            this.actor.modifyWounds(-damage)
                            ui.notifications.notify(game.i18n.format("TookDamage", { damage: damage }))
                            `
                    }
                ]
            }
        },
        "starvation1": {
            name: game.i18n.localize("EFFECT.Starvation") + " 1",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["starvation1"],
            changes: [
                { key: "system.characteristics.s.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1 },
            ]
        },
        "starvation2": {
            name: game.i18n.localize("EFFECT.Starvation") + " 2",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["starvation2"],
            changes: [
                { key: "system.characteristics.bs.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ag.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ws.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.s.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.i.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.int.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.dex.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.wp.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.fel.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1 },
                { key: "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1 },
            ],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "manual",
                        script: `
                            let tb = this.actor.characteristics.t.bonus
                            let damage = (await new Roll("1d10").roll()).total
                            damage -= tb
                            if (damage <= 0) {
                                damage = 1
                            }
                            this.actor.modifyWounds(-damage)
                            ui.notifications.notify(game.i18n.format("TookDamage", { damage: damage }))
                            `
                    }
                ]
            }
        },
        "blackpowder": {
            name: game.i18n.localize("EFFECT.BlackpowderShock"),
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["blackpowder"],
            flags: {
                wfrp4e: {
                    blackpowder: true,
                },
            },

            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "immediate",
                        script: `
                            test = await this.actor.setupSkill("Cool", {appendTitle : " - " + this.effect.name, skipTargets: true, fields : {difficulty : "average"}});
                            await test.roll();
                            if (test.failed)
                            {
                                this.actor.addCondition("broken");
                            }
                            return false;
                        `
                    }
                ]
            }
        },
        "infighting": {
            name: game.i18n.localize("EFFECT.Infighting"),
            img: "modules/wfrp4e-core/icons/talents/in-fighter.png",
            statuses: ["infighting"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "prePrepareItem",
                        script: `
                            if (args.item.type == "weapon" && args.item.isEquipped)
                            {
                                let weaponLength = args.item.reachNum
                                if (weaponLength > 3)
                                {
                                    let improv = foundry.utils.duplicate(game.wfrp4e.config.systemItems.improv)
                                    improv.system.twohanded.value = args.item.twohanded.value
                                    improv.system.offhand.value = args.item.offhand.value
                                    improv.name = args.item.name + " (" + game.i18n.localize("EFFECT.Infighting") + ")"
                                    foundry.utils.mergeObject(args.item.system, improv.system, {overwrite : true})
                                    args.item.system.qualities = improv.system.qualities
                                    args.item.system.flaws = improv.system.flaws
                                    args.item.name = improv.name
                                    args.item.system.infighting = true;
                                }
                            }
                            `
                    }
                ]
            }
        },
        "defensive": {
            name: game.i18n.localize("EFFECT.OnDefensive"),
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["defensive"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "dialog",
                        script: `args.prefillModifiers.modifier += 20`,
                        options: {
                            hideScript: "return !this.actor.isOpposing",
                            activateScript: `
                                    let skillName = this.effect.name.substring(this.effect.name.indexOf("[") + 1, this.effect.name.indexOf("]"))
                                    return args.skill?.name == skillName
                                `
                        }
                    },
                    {
                        label: "@effect.name",
                        trigger: "immediate",
                        script: `
                                let choice = await ItemDialog.create(this.actor.itemTypes.skill.sort((a, b) => a.name > b.name ? 1 : -1), 1, "Choose which skill to use with On the Defensive");    
                                this.effect.updateSource({name : this.effect.name + " [" +  choice[0]?.name + "]"})
                                `
                    }
                ]
            }
        },
        "dualwielder": {
            name: game.i18n.localize("EFFECT.DualWielder"),
            img: "modules/wfrp4e-core/icons/talents/dual-wielder.png",
            statuses: ["dualwielder"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "dialog",
                        script: `args.prefillModifiers.modifier -= 10`,
                        options: {
                            hideScript: "return !this.actor.isOpposing",
                            activateScript: `return this.actor.isOpposing`
                        }
                    },
                    {
                        label: "Start Turn",
                        trigger: "startTurn",
                        script: `this.effect.delete()`,
                    }
                ]
            }
        },
        "consumealcohol1": {
            name: game.i18n.localize("EFFECT.ConsumeAlcohol") + " 1",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["consumealcohol1"],
            changes: [
                { key: "system.characteristics.bs.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ag.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.ws.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.int.modifier", mode: 2, value: -10 },
                { key: "system.characteristics.dex.modifier", mode: 2, value: -10 },
            ]
        },
        "consumealcohol2": {
            name: game.i18n.localize("EFFECT.ConsumeAlcohol") + " 2",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["consumealcohol2"],
            changes: [
                { key: "system.characteristics.bs.modifier", mode: 2, value: -20 },
                { key: "system.characteristics.ag.modifier", mode: 2, value: -20 },
                { key: "system.characteristics.ws.modifier", mode: 2, value: -20 },
                { key: "system.characteristics.int.modifier", mode: 2, value: -20 },
                { key: "system.characteristics.dex.modifier", mode: 2, value: -20 },
            ]
        },
        "consumealcohol3": {
            name: game.i18n.localize("EFFECT.ConsumeAlcohol") + " 3",
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["consumealcohol3"],
            changes: [
                { key: "system.characteristics.bs.modifier", mode: 2, value: -30 },
                { key: "system.characteristics.ag.modifier", mode: 2, value: -30 },
                { key: "system.characteristics.ws.modifier", mode: 2, value: -30 },
                { key: "system.characteristics.int.modifier", mode: 2, value: -30 },
                { key: "system.characteristics.dex.modifier", mode: 2, value: -30 },
            ]
        },
        "stinkingdrunk1": {
            name: game.i18n.localize("EFFECT.MarienburghersCourage"),
            img: "systems/wfrp4e/icons/blank.png",
            statuses: ["stinkingdrunk1"],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "dialog",
                        script: `args.prefillModifiers.modifier += 20`,
                        options: {
                            hideScript: "return args.skill?.name != game.i18n.localize('NAME.Cool')",
                            activateScript: `return args.skill?.name == game.i18n.localize('NAME.Cool')`
                        }
                    }
                ]
            }
        }
    })

    this.statusEffects = [
        {
            img: "systems/wfrp4e/icons/conditions/bleeding.png",
            id: "bleeding",
            statuses: ["bleeding"],
            name: "WFRP4E.ConditionName.Bleeding",
            system: {
                condition : {
                    value : 1,
                    numbered: true,
                    trigger: "endRound"
                },
                scriptData: [
                    {
                        trigger: "manual",
                        label: "@effect.name",
                        script: `let actor = this.actor;
                            let effect = this.effect;
                            let bleedingAmt;
                            let bleedingRoll;
                            let msg = ""

                            let damage = effect.conditionValue;
                            let scriptArgs = {msg, damage};
                            await Promise.all(actor.runScripts("preApplyCondition", {effect, data : scriptArgs}))
                            msg = scriptArgs.msg;
                            damage = scriptArgs.damage;
                            msg += await actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, minimumOne : false, suppressMsg : true})

                            if (actor.status.wounds.value == 0 && !actor.hasCondition("unconscious"))
                            {
                                await actor.addCondition("unconscious")
                                msg += "<br>" + game.i18n.format("BleedUnc", {name: actor.prototypeToken.name })
                            }

                            if (actor.hasCondition("unconscious"))
                            {
                                bleedingAmt = effect.conditionValue;
                                bleedingRoll = (await new Roll("1d100").roll()).total;
                                if (bleedingRoll <= bleedingAmt * 10)
                                {
                                    msg += "<br>" + game.i18n.format("BleedFail", {name: actor.prototypeToken.name}) + " (" + game.i18n.localize("Rolled") + " " + bleedingRoll + ")";
                                    await actor.addCondition("dead")
                                }
                                else if (bleedingRoll % 11 == 0)
                                {
                                    msg += "<br>" + game.i18n.format("BleedCrit", { name: actor.prototypeToken.name } ) + " (" + game.i18n.localize("Rolled") + bleedingRoll + ")"
                                    await actor.removeCondition("bleeding")
                                }
                                else
                                {
                                    msg += "<br>" + game.i18n.localize("BleedRoll") + ": " + bleedingRoll;
                                }
                            }

                            await Promise.all(actor.runScripts("applyCondition", {effect, data : {bleedingRoll}}))
                            if (args.suppressMessage)
                            {
                                let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                messageData.speaker = {alias: this.effect.name}
                                messageData.flavor = this.effect.name;
                                return messageData
                            }
                            else
                            {
                                return this.script.message(msg)
                            }
                            `
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/poisoned.png",
            id: "poisoned",
            statuses: ["poisoned"],
            name: "WFRP4E.ConditionName.Poisoned",
            system: {
                condition : {
                    value : 1,
                    numbered: true,
                    trigger: "endRound"
                },
                scriptData: [
                    {
                        trigger: "manual",
                        label: "@effect.name",
                        script: `let actor = this.actor;
                            let effect = this.effect;
                            let msg = ""

                            let damage = effect.conditionValue;
                            let scriptArgs = {msg, damage};
                            await Promise.all(actor.runScripts("preApplyCondition", {effect, data : scriptArgs}))
                            msg = scriptArgs.msg;
                            damage = scriptArgs.damage;
                            msg += await actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true})

                            await Promise.all(actor.runScripts("applyCondition", {effect}))
                            if (args.suppressMessage)
                            {
                                let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                messageData.speaker = {alias: this.effect.name}
                                return messageData
                            }
                            else
                            {
                                return this.script.message(msg)
                            }
                            `
                    },
                    {
                        trigger: "dialog",
                        label: "@effect.name",
                        script: `args.fields.modifier -= 10 * this.effect.conditionValue`,
                        options: {
                                activateScript: "return true"
                        }
                    }
                ]
            }

        },
        {
            img: "systems/wfrp4e/icons/conditions/ablaze.png",
            id: "ablaze",
            statuses: ["ablaze"],
            name: "WFRP4E.ConditionName.Ablaze",
            system: {
                condition : {
                    value : 1,
                    numbered: true,
                    trigger: "endRound"
                },
                scriptData: [
                    {
                        trigger: "manual",
                        label: "@effect.name",
                        script: `let leastProtectedLoc;
                            let leastProtectedValue = 999;
                            for (let loc in this.actor.status.armour)
                            {
                                if (this.actor.status.armour[loc].value != undefined && this.actor.status.armour[loc].value < leastProtectedValue)
                                {
                                    leastProtectedLoc = loc;
                                    leastProtectedValue = this.actor.status.armour[loc].value;
                                }
                            }

                            let formula = "1d10 + @effect.conditionValue - 1"
                            let msg = "<b>${game.i18n.localize("Formula")}</b>: @FORMULA"

                            let scriptArgs = {msg, formula}
                            await Promise.all(this.actor.runScripts("preApplyCondition", {effect : this.effect, data : scriptArgs}));
                            formula = scriptArgs.formula;
                            msg = scriptArgs.msg;
                            let roll = await new Roll(formula, this).roll();
                            let terms = roll.terms.map(i => (i instanceof Die ? (i.formula + " (" + i.total + ")") : (i.total))).join("")
                            msg = msg.replace("@FORMULA", terms);

                            let damageMsg = ("<br>" + await this.actor.applyBasicDamage(roll.total, {loc: leastProtectedLoc, suppressMsg : true})).split("")
                            msg += damageMsg.join("");
                            await Promise.all(this.actor.runScripts("applyCondition", {effect : this.effect}))
                            if (args.suppressMessage)
                            {
                                let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                messageData.speaker = {alias: this.actor.prototypeToken.name}
                                messageData.flavor = this.effect.name
                                return messageData
                            }
                            else
                            {
                                return this.script.message(msg)
                            }
                            `
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/deafened.png",
            id: "deafened",
            statuses: ["deafened"],
            name: "WFRP4E.ConditionName.Deafened",
            system: {
                condition : {
                    value : 1,
                    numbered: true
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "Tests related to hearing",
                        script: `args.fields.modifier -= 10 * this.effect.conditionValue`
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/stunned.png",
            id: "stunned",
            statuses: ["stunned"],
            name: "WFRP4E.ConditionName.Stunned",
            system: {
                condition : {
                    value : 1,
                    numbered: true
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "Penalty to all Tests (@effect.name)",
                        script: `args.fields.modifier -= 10 * this.effect.conditionValue`,
                        options: {
                            activateScript: "return true"
                        }
                    }
                    // { // Not sure what to do about this
                    //     trigger: "dialog",
                    //     label : "Bonus to Melee Attacks",
                    //     script : `args.fields.modifier -= 10 * this.effect.conditionValue`,
                    //     "options.dialog.targeter" : true
                    // }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/entangled.png",
            id: "entangled",
            statuses: ["entangled"],
            name: "WFRP4E.ConditionName.Entangled",
            system: {
                condition : {
                    value : 1,
                    numbered: true
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "Tests related to movement of any kind",
                        script: `args.fields.modifier -= 10 * this.effect.conditionValue`,
                        options: {
                                activateScript: "return ['ws', 'bs', 'ag'].includes(args.characteristic)"
                        }
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/fatigued.png",
            id: "fatigued",
            statuses: ["fatigued"],
            name: "WFRP4E.ConditionName.Fatigued",
            system: {
                condition : {
                    value : 1,
                    numbered: true
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "Penalty to all Tests (@effect.name)",
                        script: `args.fields.modifier -= 10 * this.effect.conditionValue`,
                        options: {
                                activateScript: "return true"
                        }
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/blinded.png",
            id: "blinded",
            statuses: ["blinded"],
            name: "WFRP4E.ConditionName.Blinded",
            system: {
                condition : {
                    value : 1,
                    numbered: true
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "Tests related to sight",
                        script: `args.fields.modifier -= 10 * this.effect.conditionValue`,
                        options: {
                                activateScript: "return ['ws', 'bs', 'ag'].includes(args.characteristic)"
                        }
                    },
                    {
                        trigger: "dialog",
                        label: "Bonus to melee attacks",
                        script: `args.fields.modifier += 10 * this.effect.conditionValue`,
                        options: {
                                targeter: true,
                                hideScript: "return args.item?.attackType != 'melee'",
                                activateScript: "return args.item?.attackType == 'melee'"
                        }
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/broken.png",
            id: "broken",
            statuses: ["broken"],
            name: "WFRP4E.ConditionName.Broken",
            system: {
                condition : {
                    value : 1,
                    numbered: true
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "Penalty to all Tests not involving running and hiding.",
                        script: `args.fields.modifier -= 10 * this.effect.conditionValue`,
                        options: {
                            activateScript: "return !args.skill?.name?.includes(game.i18n.localize('NAME.Stealth')) && args.skill?.name != game.i18n.localize('NAME.Athletics')"
                        }
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/prone.png",
            id: "prone",
            statuses: ["prone"],
            name: "WFRP4E.ConditionName.Prone",
            system: {
                condition : {
                    value : null,
                    numbered: false
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "Tests related to movement of any kind",
                        script: `args.fields.modifier -= 20`,
                        options: {
                                activateScript: "return ['ws', 'bs', 'ag'].includes(args.characteristic)"
                        }
                    },
                    {
                        trigger: "dialog",
                        label: "Bonus to melee attacks",
                        script: `args.fields.modifier += 20`,
                        options: {
                            targeter: true,
                            hideScript: "return args.item?.system.attackType != 'melee'",
                            activateScript: "return args.item?.system.attackType == 'melee'"
                        }
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/surprised.png",
            id: "surprised",
            statuses: ["surprised"],
            name: "WFRP4E.ConditionName.Surprised",
            system: {
                condition : {
                    value : null,
                    numbered: false
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "Bonus to melee attacks",
                        script: `args.fields.modifier += 20`,
                        options: {
                            targeter: true,
                            hideScript: "return args.item?.system.attackType != 'melee'",
                            activateScript: "return args.item?.system.attackType == 'melee'"
                        }
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/unconscious.png",
            id: "unconscious",
            statuses: ["unconscious"],
            name: "WFRP4E.ConditionName.Unconscious",
            system : {
                condition : {
                    value : null,
                    numbered: false
                },
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/grappling.png",
            id: "grappling",
            statuses: ["grappling"],
            name: "WFRP4E.ConditionName.Grappling",
            system : {
                condition : {
                    value : null,
                    numbered: false
                },
            }
        },
        {
            img: "systems/wfrp4e/icons/conditions/engaged.png",
            id: "engaged",
            statuses: ["engaged"],
            name: "WFRP4E.ConditionName.Engaged",
            system: {
                condition : {
                    value : null,
                    numbered: false
                },
                scriptData: [
                    {
                        trigger: "dialog",
                        label: "@effect.name",
                        script: `args.abort = true
                        ui.notifications.error(game.i18n.localize("EFFECT.ShooterEngagedError"))`,
                        options: {
                                hideScript: "return !args.weapon || args.weapon.isMelee || args.weapon.properties.qualities.pistol",
                                activateScript: "return args.weapon.isRanged && !args.weapon.properties.qualities.pistol"
                        }
                    }
                ]
            }
        },
        {
            img: "systems/wfrp4e/icons/defeated.png",
            id: "dead",
            statuses: ["dead"],
            name: "WFRP4E.ConditionName.Dead",
            system : {
                condition : {
                    value : null,
                    numbered: false
                },
            }
        }
    ]


    foundry.utils.mergeObject(this.propertyEffects, {

        // Qualities
        accurate: {
            name : game.i18n.localize("PROPERTY.Accurate"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item"
                },
                scriptData : [{
                    label : "Accurate",
                    trigger : "dialog",
                    script : "args.fields.modifier += 10;",
                    options : {
                        hideScript : "",
                        activateScript : "return true"
                    }
                },
                {
                    label : "Script",
                    trigger : "manual",
                    script : "this.script.notification('test')",
                }
            ],
            }
        },
        blackpowder: {
            img : "systems/wfrp4e/icons/blank.png",
            name: game.i18n.localize("EFFECT.BlackpowderShock"),
            system: {
                transferData : {
                    type : "target",
                    documentType : "Actor"
                },
                scriptData: [
                    {
                        label: "@effect.name",
                        trigger: "immediate",
                        script: `
                            test = await this.actor.setupSkill("Cool", {appendTitle : " - " + this.effect.name, skipTargets: true, fields : {difficulty : "average"}});
                            await test.roll();
                            if (test.failed)
                            {
                                this.actor.addCondition("broken");
                            }
                            return false;
                        `
                    }
                ]
            }
        },
        blast: {
            name : game.i18n.localize("PROPERTY.Blast"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item"
                },
                scriptData : [{
                    label : "Blast",
                    trigger : "rollWeaponTest",
                    script : "if (args.test.succeeded) args.test.result.other.push(`<a class='aoe-template' data-type='radius'><i class='fas fa-ruler-combined'></i>${this.item.properties.qualities.blast.value} yard Blast</a>`)",
                }]
            }
        },
        damaging: {
            name : game.i18n.localize("PROPERTY.Damaging"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        defensive: {
            name : game.i18n.localize("PROPERTY.Defensive"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Actor",
                    equipTransfer: true
                },
                scriptData : [{
                    label : "Defensive",
                    trigger : "dialog",
                    script : "args.fields.slBonus++;",
                    options : {
                        activateScript : "return args.actor.attacker",
                        hideScript : "return !args.actor.attacker"
                    }
                }]
            }
        },
        distract: {
            name : game.i18n.localize("PROPERTY.Distract"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        entangle: {
            name : game.i18n.localize("PROPERTY.Entangle"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
                scriptData : [{
                    label : "Entangle",
                    trigger : "applyDamage",
                    script : "args.actor.addCondition('entangled')"
                }]
            }

        },
        fast: {
            name : game.i18n.localize("PROPERTY.Fast"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        hack: {
            name : game.i18n.localize("PROPERTY.Hack"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        impact: {
            name : game.i18n.localize("PROPERTY.Impact"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        impale: {
            name : game.i18n.localize("PROPERTY.Impale"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        magical: {
            name : game.i18n.localize("PROPERTY.Magical"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        penetrating: {
            name : game.i18n.localize("PROPERTY.Penetrating"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        pistol: {
            name : game.i18n.localize("PROPERTY.Pistol"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        precise: {
            name : game.i18n.localize("PROPERTY.Precise"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item"
                },
                scriptData : [{
                    label : "Precise",
                    trigger : "dialog",
                    script : "args.fields.successBonus += 1;",
                    options : {
                        hideScript : "",
                        activateScript : "return true"
                    }
                }]
            }
        },
        pummel: {
            name : game.i18n.localize("PROPERTY.Pummel"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        repeater: {
            name : game.i18n.localize("PROPERTY.Repeater"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        shield: {
            name : game.i18n.localize("PROPERTY.Shield"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        trapblade: {
            name : game.i18n.localize("PROPERTY.TrapBlade"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        unbreakable: {
            name : game.i18n.localize("PROPERTY.Unbreakable"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        wrap: {
            name : game.i18n.localize("PROPERTY.Wrap"),
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },




        // Flaws
        dangerous: {
            name : game.i18n.localize("PROPERTY.Dangerous"), 
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        imprecise: {
            name : game.i18n.localize("PROPERTY.Imprecise"), 
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item"
                },
                scriptData : [{
                    label : "Imprecise",
                    trigger : "dialog",
                    script : "args.fields.slBonus -= 1;",
                    options : {
                        hideScript : "",
                        activateScript : "return true"
                    }
                }]
            }
        },
        reload: {
            name : game.i18n.localize("PROPERTY.Reload"), 
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        slow: {
            name : game.i18n.localize("PROPERTY.Slow"), 
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        tiring: {
            name : game.i18n.localize("PROPERTY.Tiring"), 
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
        undamaging: {
            name : game.i18n.localize("PROPERTY.Undamaging"), 
            img : "systems/wfrp4e/icons/blank.png",
            system : {
                transferData : {
                    documentType : "Item",
                },
            }
        },
    })

}


WFRP4E.effectTextStyle = CONFIG.canvasTextStyle.clone();
WFRP4E.effectTextStyle.fontSize = "30";
WFRP4E.effectTextStyle.fontFamily="CaslonAntique"

WFRP4E.rollModes = CONFIG.Dice.rollModes;


// To migrate
// "invoke => manual"
// "oneTime" => "immediate"
// "addItems" => "immediate"
// "dialogChoice" => ???
// "prefillDialog" => "dialog"
// "targetPrefillDialog" => "dialog" with targeter option true
WFRP4E.scriptTriggers = {
    "manual" : "Manually Invoked",
    "immediate" : "Immediate",
    "dialog" : "Dialog",
    "addItems" : "Add Items",
    "preUpdate" : "Pre Update",
    "update" : "On Update",
    "equipToggle" : "Equip Toggle",
    "prePrepareData" : "Pre-Prepare Data",
    "prePrepareItems" : "Pre-Prepare Actor Items",
    "prepareData" : "Prepare Data",
    "prepareOwned" : "Prepare Owned Data (For Items)",
    "computeCharacteristics" : "Compute Characteristics",
    "computeEncumbrance" : "Compute Encumbrance",
    "preWoundCalc" : "Pre-Wound Calculation",
    "woundCalc" : "Wound Calculation",
    "calculateSize" : "Size Calculation",
    "preAPCalc" : "Pre-Armour Calculation",
    "APCalc" : "Armour Calculation",
    "preApplyDamage" : "Pre-Apply Damage",
    "applyDamage" : "Apply Damage",
    "preTakeDamage" : "Pre-Take Damage",
    "takeDamage" : "Take Damage",
    "computeTakeDamageModifiers" : "Compute Take Damage Modifiers",
    "computeApplyDamageModifiers" : "Compute Apply Damage Modifiers",
    "preApplyCondition" : "Pre-Apply Condition",
    "applyCondition" : "Apply Condition",
    "prePrepareItem" : "Pre-Prepare Item",
    "prepareItem" : "Prepare Item",
    "preRollTest" : "Pre-Roll Test",
    "preRollWeaponTest" : "Pre-Roll Weapon Test",
    "preRollCastTest" : "Pre-Roll Casting Test",
    "preChannellingTest" : "Pre-Roll Channelling Test",
    "preRollPrayerTest" : "Pre-Roll Prayer Test",
    "preRollTraitTest" : "Pre-Roll Trait Test",
    "rollTest" : "Roll Test",
    "rollIncomeTest" : "Roll Income Test",
    "rollWeaponTest" : "Roll Weapon Test",
    "rollCastTest" : "Roll Casting Test",
    "rollChannellingTest" : "Roll Channelling Test",
    "rollPrayerTest" : "Roll Prayer Test",
    "rollTraitTest" : "Roll Trait Test",
    "preOpposedAttacker" : "Pre-Opposed Attacker",
    "preOpposedDefender" : "Pre-Opposed Defender",
    "opposedAttacker" : "Opposed Attacker",
    "opposedDefender" : "Opposed Defender",
    "calculateOpposedDamage" : "Calculate Opposed Damage",
    "targetPrefillDialog" : "Prefill Targeter's Dialog",
    "getInitiativeFormula" : "Get Initiative",
    "createToken" : "Create Token",
    "deleteEffect" : "Effect Deleted",
    "startCombat"  : "WH.Trigger.StartCombat",
    "startRound" : "WH.Trigger.StartRound",
    "startTurn" : "Start Turn",
    "updateCombat"  : "WH.Trigger.UpdateCombat",
    "endTurn" : "End Turn",
    "endRound" : "End Round",
    "endCombat" : "End Combat",

}

WFRP4E.syncTriggers = [
    "prePrepareData",
    "prePrepareItems",
    "prepareData",
    "preWoundCalc",
    "woundCalc",
    "calculateSize",
    "preAPCalc",
    "APCalc",
    "prePrepareItem",
    "prepareItem",
    "getInitiativeFormula"
];

WFRP4E.triggerMapping = {
    "update" : "updateDocument",
    "addItems" : "onCreate",
    "preUpdate" : "preUpdateDocument"
};

WFRP4E.getZoneTraitEffects = (region) => 
{
    return [];
}
   
export default WFRP4E
