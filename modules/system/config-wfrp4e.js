const WFRP4E = {}
CONFIG.ChatMessage.template = "systems/wfrp4e/templates/chat/chat-message.html"

WFRP4E.creditOptions = {
    SPLIT: "split",
    EACH: "each",
}



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
    "Food": "systems/wfrp4e/icons/buildings/food.png",
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
    "flexible": "Flexible",
    "impenetrable": "Impenetrable",
};

// Armor Flaws
WFRP4E.armorFlaws = {
    "partial": "Partial",
    "weakpoints": "Weakpoints",
};

// Equipment Types
WFRP4E.armorTypes = {
    "softLeather": "WFRP4E.ArmourType.SLeather",
    "boiledLeather": "WFRP4E.ArmourType.BLeather",
    "mail": "WFRP4E.ArmourType.Mail",
    "plate": "WFRP4E.ArmourType.Plate",
    "other": "WFRP4E.ArmourType.Other"
};

// Range Test Modifiers
WFRP4E.rangeModifiers = {
    "Point Blank": "Easy (+40)",
    "Short Range": "Average (+20)",
    "Normal": "Challenging (+0)",
    "Long Range": "Difficult (-10)",
    "Extreme": "Very Hard (-30)",
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

    "veasy": "Very Easy (+60)",
    "easy": "Easy (+40)",
    "average": "Average (+20)",
    "challenging": "Challenging (+0)",
    "difficult": "Difficult (-10)",
    "hard": "Hard (-20)",
    "vhard": "Very Hard (-30)"
}

WFRP4E.locations = {
    "head": "Head",
    "body": "Body",
    "rArm": "Right Arm",
    "lArm": "Left Arm",
    "rLeg": "Right Leg",
    "lLeg": "Left Leg",
}

// Trapping Availability
WFRP4E.availability = {
    "None": "-",
    "common": "WFRP4E.Availability.Common",
    "scarce": "WFRP4E.Availability.Scarce",
    "rare": "WFRP4E.Availability.Rare",
    "exotic": "WFRP4E.Availability.Exotic",
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
    "petty": "Petty",
    "beasts": "Beasts",
    "death": "Death",
    "fire": "Fire",
    "heavens": "Heavens",
    "metal": "Metal",
    "life": "Life",
    "light": "Light",
    "shadow": "Shadow",
    "hedgecraft": "Hedgecraft",
    "witchcraft": "Witchcraft",
    "daemonology": "Daemonology",
    "necromancy": "Necromancy",
    "nurgle": "Nurgle",
    "slaanesh": "Slaanesh",
    "tzeentch": "Tzeentch",
};

// Given a Lore, what is the Wind
WFRP4E.magicWind = {
    "petty": "None",
    "beasts": "Ghur",
    "death": "Shyish",
    "fire": "Aqshy",
    "heavens": "Azyr",
    "metal": "Chamon",
    "life": "Ghyran",
    "light": "Hysh",
    "shadow": "Ulgu",
    "hedgecraft": "None",
    "witchcraft": "None",
    "daemonology": "Dhar",
    "necromancy": "Dhar",
    "nurgle": "Dhar",
    "slaanesh": "Dhar",
    "tzeentch": "Dhar",
};



// Types of prayers
WFRP4E.prayerTypes = {
    "blessing": "Blessing",
    "miracle": "Miracle"
}

WFRP4E.mutationTypes = {
    "physical": "Physical",
    "mental": "Mental"
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
    "fear": "WFRP4E.ConditionName.Fear",
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

// WFRP4E.traitBonuses = {
//     "big": {
//         "s": 10,
//         "t": 10,
//         "ag": -5
//     },
//     "brute": {
//         "m": -1,
//         "t": 10,
//         "s": 10,
//         "ag": -10
//     },
//     "clever": {
//         "int": 20,
//         "i": 10
//     },
//     "cunning": {
//         "int": 10,
//         "fel": 10,
//         "i": 10
//     },
//     "elite": {
//         "ws": 20,
//         "bs": 20,
//         "wp": 20
//     },
//     "fast": {
//         "ag": 10,
//         "m": 1
//     },
//     "leader": {
//         "fel": 10,
//         "wp": 10
//     },
//     "tough": {
//         "t": 10,
//         "wp": 10
//     },
//     "swarm": {
//         "ws": 10
//     }
// }

// WFRP4E.talentBonuses = {
//     "savvy": "int",
//     "suave": "fel",
//     "marksman": "bs",
//     "very strong": "s",
//     "sharp": "i",
//     "lightning reflexes": "ag",
//     "coolheaded": "wp",
//     "very resilient": "t",
//     "nimble fingered": "dex",
//     "warrior born": "ws"
// }

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
    "Corruption"
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


WFRP4E.species = {};
WFRP4E.speciesCharacteristics = {}
WFRP4E.speciesSkills = {}
WFRP4E.speciesTalents = {}
WFRP4E.speciesMovement = {}
WFRP4E.speciesFate = {}
WFRP4E.speciesRes = {}
WFRP4E.speciesExtra = {}
WFRP4E.speciesAge = {}
WFRP4E.speciesHeight = {}
WFRP4E.classTrappings = {}
WFRP4E.weaponGroupDescriptions = {};
WFRP4E.reachDescription = {}
WFRP4E.qualityDescriptions = {};
WFRP4E.flawDescriptions = {};
WFRP4E.loreEffect = {};
WFRP4E.conditionDescriptions = {}
WFRP4E.symptoms = {}
WFRP4E.symptomDescriptions = {}
WFRP4E.symptomTreatment = {}
WFRP4E.conditionDescriptions = {}


WFRP4E.symptomEffects = {}

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
    "hitloc": "Standard",
    "snake": "Snake-Like",
    "spider": "Spider-Like"
}

WFRP4E.extendedTestCompletion = {
    none: "None",
    reset: "Reset",
    remove: "Remove"
}

WFRP4E.actorSizeEncumbrance = {
    "tiny": 0,
    "ltl": 2,
    "sml": 5,
    "avg": 10,
    "lrg": 20,
    "enor": 40,
    "mnst": 100
}


WFRP4E.systemItems = {
    reload : {
        type: "extendedTest",
        name: "",
        data: {
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
          name: "Improvised Weapon",
          type: "weapon",
          effects : [],
          data: {
            damage: { value: "SB + 2" },
            reach: { value: "personal" },
            weaponGroup: { value: "basic" },
            twohanded: { value: false },
            qualities: { value: "" },
            flaws: { value: "Undamaging" },
            special: { value: "" },
            range: { value: "" },
            ammunitionGroup: { value: "" },
            offhand: { value: false },
          }
    },
    stomp : {
        name: "Stomp",
        type: "trait",
          effects : [],
          data: {
            specification: { value: "4" },
            rollable: { value: true, rollCharacteristic: "ws", bonusCharacteristic: "s", defaultDifficulty: "challenging" },
        }
    },
    unarmed : {
          name: "Unarmed",
          type: "weapon",
          effects : [],
          data: {
            damage: { value: "SB + 0" },
            reach: { value: "personal" },
            weaponGroup: { value: "brawling" },
            twohanded: { value: false },
            qualities: { value: "" },
            flaws: { value: "Undamaging" },
            special: { value: "" },
            range: { value: "" },
            ammunitionGroup: { value: "" },
            offhand: { value: false },
          }
      },

    fear : {
        name : "WFRP4E.ConditionName.Fear",
        type : "extendedTest",
        data : {
            completion:{value: 'remove'},
            description:{type: 'String', label: 'Description', value: ''},
            failingDecreases:{value: true},
            gmdescription:{type: 'String', label: 'Description', value: ''},
            hide: { test: false, progress: false },
            negativePossible: { value: false },
            SL: { current: 0, target: 1 },
            test: { value: 'Cool' }
        },
        effects:
            [{
                label: "Fear",
                icon: "systems/wfrp4e/icons/conditions/fear.png",
                transfer: true,
                flags: {
                    wfrp4e: {
                        "effectTrigger": "dialogChoice",
                        "effectData": {
                            "description": "Tests to affect",
                            "slBonus": "-1"
                        },
                        "script": `
                            if (this.flags.wfrp4e.fearName)
                                this.flags.wfrp4e.effectData.description += " " + this.flags.wfrp4e.fearName
                            else
                                this.flags.wfrp4e.effectData.description += " the source of fear"
                        `}
                }
            }
            ]

    }

}


WFRP4E.conditionScripts = {
    "ablaze" : async function (actor) {
        let effect = actor.hasCondition("ablaze")

        let leastProtectedLoc;
        let leastProtectedValue = 999;
        for (let loc in actor.data.AP)
        {
            if (actor.data.AP[loc].value != undefined && actor.data.AP[loc].value < leastProtectedValue)
            {
                leastProtectedLoc = loc;
                leastProtectedValue = actor.data.AP[loc].value;
            }
        }
        let rollString = `1d10 + ${value - 1}`

        let roll = new Roll(`${rollString} - ${leastProtectedValue || 0}`).roll();

        let msg = `<h2>Ablaze</h2><b>Formula</b>: ${rollString}<br><b>Roll</b>: ${roll.results.splice(0, 3).join(" ")}` // Don't show AP in the roll formula

        actor.runEffects("preApplyCondition", {effect, data : {msg, roll, rollString}})
        let value = effect.flags.wfrp4e.value;
        let damageMsg = (`<br>` + await actor.applyBasicDamage(roll.total, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg : true})).split("")
        damageMsg.splice(damageMsg.length-1, 1) // Removes the parentheses and adds + AP amount.
        msg += damageMsg.join("").concat(` + ${leastProtectedValue} AP)`)
        let messageData = game.wfrp4e.utility.chatDataSetup(msg);
        messageData.speaker = {alias: actor.data.token.name}
        actor.runEffects("applyCondition", {effect, data : {messageData}})
        return messageData
    },
    "poisoned" : async function (actor) {
        let effect = actor.hasCondition("poisoned")
        let msg = `<h2>Poisoned</h2>`

        actor.runEffects("preApplyCondition", {effect, data : {msg}})
        let value = effect.flags.wfrp4e.value;
        msg += await actor.applyBasicDamage(value, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true})
        let messageData = game.wfrp4e.utility.chatDataSetup(msg);
        messageData.speaker = {alias: actor.data.token.name}
        actor.runEffects("applyCondition", {effect, data : {messageData}})
        return messageData
    },
    "bleeding" : async function(actor) {
        let effect = actor.hasCondition("bleeding")
        let bleedingAmt;
        let bleedingRoll;
        let msg = `<h2>Bleeding</h2>`

        actor.runEffects("preApplyCondition", {effect, data : {msg}})
        let value = effect.flags.wfrp4e.value;
        msg += await actor.applyBasicDamage(value, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, minimumOne : false, suppressMsg : true})

        if (actor.data.data.status.wounds.value == 0 && !actor.hasCondition("unconscious"))
        {
            await actor.addCondition("unconscious")
            msg += `<br><b>${actor.data.token.name}</b> falls unconscious!`
        }

        if (actor.hasCondition("unconscious"))
        {
            bleedingAmt = value;
            bleedingRoll = new Roll("1d100").roll().total;
            if (bleedingRoll <= bleedingAmt * 10)
            {
                msg += `<br><b>${actor.data.token.name}</b> dies from blood loss! (Rolled ${bleedingRoll})`
                actor.addCondition("dead")
            }
            else if (bleedingRoll % 11 == 0)
            {
                msg += `<br><b>${actor.data.token.name}'s</b> blood clots a little and loses 1 Bleeding Condition (Rolled ${bleedingRoll})`
                actor.removeCondition("bleeding")
            }
            else 
            {
                msg += `<br>Bleeding Roll: ${bleedingRoll}`
            }
        }

        let messageData = game.wfrp4e.utility.chatDataSetup(msg);
        messageData.speaker = {alias: actor.data.token.name}
        actor.runEffects("applyCondition", {effect, data : {messageData, bleedingRoll}})
        return messageData
    }
}

WFRP4E.systemScripts = {
    conditions : {

    },
    endCombat : {
        corruption : function (combat) {
            let corruptionCounters = []

            for(let turn of combat.turns) {
              let corruption = turn.actor.has(game.i18n.localize("NAME.Corruption"))
              if (corruption)
              {
                let existing = corruptionCounters.find(c => c.type == corruption.data.specification.value)
                if (existing)
                  existing.counter++;
                else 
                  corruptionCounters.push({counter : 1, type : corruption.data.specification.value})
              }
            }
        
            let content = ""
        
            if (corruptionCounters.length)
            {
              content += `<h3><b>Corruption</b></h3>`
              for(let corruption of corruptionCounters)
              {
                content+=`${corruption.counter} ${corruption.type}<br>`
              }
              content+= `<br><b>Click a corruption link to prompt a test for Corruption</b>`
              content += `<br>@Corruption[Minor]<br>@Corruption[Moderate]<br>@Corruption[Major]`
            }
            return content        
        },
        minorInfections : function(combat) {
            let minorInfections = combat.getFlag("wfrp4e", "minorInfections") || []
            let content = ""
            if (minorInfections.length)
            {
                content += `<h3><b>Minor Infections</b></h3>These actors have received Critical Wounds and needs to succeed a <b>Very Easy (+60) Endurance Test</b> or gain a @Compendium[wfrp4e-core.diseases.1hQuVFZt9QnnbWzg]{Minor Infection}.<br>`
                for(let actor of minorInfections)
                {
                    content += `<br><b>${actor}</b>`
                }
            }
            return content
        },
        diseases : function(combat) {
            let diseaseCounters = []

            for(let turn of combat.turns) {
              let disease = turn.actor.has(game.i18n.localize("NAME.Disease"))
              if (disease)
              {
                let existing = diseaseCounters.find(d => d.type == disease.data.specification.value)
                if (existing)
                  existing.counter++;
                else 
                    diseaseCounters.push({counter : 1, type : disease.data.specification.value})
              }
            }
            let content = ""
        
            if (diseaseCounters.length)
            {
              content += `<h3><b>Diseases</b></h3>`
              for(let disease of diseaseCounters)
                content+=`${disease.counter} <a class="item-lookup" data-type="disease" data-open="sheet">${disease.type}</a><br>`
                
              content+= `<br>Refer to the diseases for their Contraction Rules`
            }
            return content        
        }
    }
}

WFRP4E.effectTextStyle = CONFIG.canvasTextStyle.clone();
WFRP4E.effectTextStyle.fontSize = "30";
WFRP4E.effectTextStyle.fontFamily="CaslonAntique"

WFRP4E.statusEffects = [
    {
        icon: "systems/wfrp4e/icons/conditions/bleeding.png",
        id: "bleeding",
        label: "Bleeding",
        flags: {
            wfrp4e: {
                "trigger": "endRound",
                "value": 1
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/poisoned.png",
        id: "poisoned",
        label: "Poisoned",
        flags: {
            wfrp4e: {
                "trigger": "endRound",
                "effectTrigger": "prefillDialog",
                "script": "args.prefillModifiers.modifier -= 10 * getProperty(this.effect, 'flags.wfrp4e.value')",
                "value": 1
            }
        }
        
    },
    {
        icon: "systems/wfrp4e/icons/conditions/ablaze.png",
        id: "ablaze",
        label: "Ablaze",
        flags: {
            wfrp4e: {
                "trigger": "endRound",
                "value": 1
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/deafened.png",
        id: "deafened",
        label: "Deafened",
        flags: {
            wfrp4e: {
                "trigger": "endRound",
                "effectTrigger": "dialogChoice",
                "effectData" : {
                    "description" : "Tests related to hearing",
                    "modifier" : "-10 * this.flags.wfrp4e.value"
                },
                "value": 1
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/stunned.png",
        id: "stunned",
        label: "Stunned",
        flags: {
            wfrp4e: {
                "trigger": "endRound",
                "effectTrigger": "prefillDialog",
                "script": "args.prefillModifiers.modifier -= 10 * getProperty(this.effect, 'flags.wfrp4e.value')",
                "value": 1
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/entangled.png",
        id: "entangled",
        label: "Entangled",
        flags: {
            wfrp4e: {
                "trigger": "endRound",
                "effectTrigger": "dialogChoice",
                "effectData" : {
                    "description" : "Tests related to movement of any kind",
                    "modifier" : "-10 * this.flags.wfrp4e.value"
                },
                "value": 1
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/fatigued.png",
        id: "fatigued",
        label: "Fatigued",
        flags: {
            wfrp4e: {
                "effectTrigger": "prefillDialog",
                "script": "args.prefillModifiers.modifier -= 10 * getProperty(this.effect, 'flags.wfrp4e.value')",
                "value" : 1
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/blinded.png",
        id: "blinded",
        label: "Blinded",
        flags: {
            wfrp4e: {
                "trigger": "endRound",
                "effectTrigger": "dialogChoice",
                "effectData" : {
                    "description" : "Tests related to sight",
                    "modifier" : "-10 * this.flags.wfrp4e.value"
                },
                "value": 1,
                "secondaryEffect" :{
                    "effectTrigger": "targetPrefillDialog",
                    "script": "if (args.type == 'weapon' && args.item.attackType=='melee') args.prefillModifiers.modifier += 10 * getProperty(this.effect, 'flags.wfrp4e.value')",
                }
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/broken.png",
        id: "broken",
        label: "Broken",
        flags: {
            wfrp4e: {
                "effectTrigger": "prefillDialog",
                "script": "args.prefillModifiers.modifier -= 10 * getProperty(this.effect, 'flags.wfrp4e.value')",
                "value": 1
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/prone.png",
        id: "prone",
        label: "Prone",
        flags: {
            wfrp4e: {
                "effectTrigger": "dialogChoice",
                "effectData" : {
                    "description" : "Tests related to movement of any kind",
                    "modifier" : "-20"
                },
                "value": null,
                "secondaryEffect" :{
                    "effectTrigger": "targetPrefillDialog",
                    "script": "if (args.type == 'weapon' && args.item.attackType=='melee') args.prefillModifiers.modifier += 20",
                }
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/fear.png",
        id: "fear",
        label: "Fear",
        flags: {
            wfrp4e: {
                "effectTrigger": "dialogChoice",
                "effectData" : {
                    "description" : "Tests to affect",
                    "slBonus" : "-1"
                },
                "script" : `
                    if (this.flags.wfrp4e.fearName)
                        this.flags.wfrp4e.effectData.description += " " + this.flags.wfrp4e.fearName
                    else
                        this.flags.wfrp4e.effectData.description += " the source of fear"
                `,
                "value": null
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/surprised.png",
        id: "surprised",
        label: "Surprised",
        flags: {
            wfrp4e: {
                "value": null,
                "secondaryEffect" :{
                    "effectTrigger": "targetPrefillDialog",
                    "script": "if (args.type == 'weapon' && args.item.attackType=='melee') args.prefillModifiers.modifier += 20",
                }
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/unconscious.png",
        id: "unconscious",
        label: "Unconscious",
        flags: {
            wfrp4e: {
                "value": null
            }
        }
    },
    {
        icon: "systems/wfrp4e/icons/conditions/grappling.png",
        id: "grappling",
        label: "Grappling",
        flags: {
            wfrp4e: {
                "value": null
            }
        }
        
    },
    {
        icon: "systems/wfrp4e/icons/defeated.png",
        id: "dead",
        label: "Dead",
        flags: {
            wfrp4e: {
                "value": null
            }
        }
        
    }
]



WFRP4E.symptomEffects = {
    "blight": {
        label: "Blight",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "invoke",
                "symptom" : true,
                "script": `
                    let difficulty = ""
                    if (this.effect.label.includes("Moderate"))
                        difficulty = "easy"
                    else if (this.effect.label.includes("Severe"))
                        difficulty = "average"
                    else
                        difficulty = "veasy"

                    if (args.actor.owner)
                    {
                        args.actor.setupSkill("Endurance", {absolute: {difficulty}}).then(setupData => {
                            args.actor.basicTest(setupData).then(test => 
                                {
                                    if (test.result.result == "failure")
                                        args.actor.addCondition("dead")
                                })
                            })
                    }`
            }
        }
    },
    "buboes": {
        label: "Buboes",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "prefillDialog",
                "symptom": true,
                "script": `
                let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]
                if (args.type == "weapon")
                    args.prefillModifiers.modifier -= 10
                else if (args.type == "characteristic")
                {
                    if (applicableCharacteristics.includes(args.item))
                        args.prefillModifiers.modifier -= 10
                }
                else if (args.type == "skill")
                {
                    if (applicableCharacteristics.includes(args.item.data.characteristic.value))
                        args.prefillModifiers.modifier -= 10
                }
        `}
        }
    },
    "convulsions": {
        label: "Convulsions",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "prefillDialog",
                "symptom" : true,
                "script": `
                    let modifier = 0
                    if (this.effect.label.includes("Moderate"))
                        modifier = -20
                    else
                        modifier = -10
                    
                    let applicableCharacteristics = ["ws", "bs", "s", "ag", "t", "dex"]
                    if (args.type == "weapon")
                        args.prefillModifiers.modifier += modifier
                    else if (args.type == "characteristic")
                    {
                        if (applicableCharacteristics.includes(args.item))
                            args.prefillModifiers.modifier += modifier
                    }
                    else if (args.type == "skill")
                    {
                        if (applicableCharacteristics.includes(args.item.data.characteristic.value))
                            args.prefillModifiers.modifier += modifier
                    }
                }`
            }
        }
    },
    "fever": {
        label: "Fever",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "prefillDialog",
                "symptom" : true,
                "script": `
                   
                let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]

                if (args.type == "weapon")
                    args.prefillModifiers.modifier -= 10
                else if (args.type == "characteristic")
                {
                    if (applicableCharacteristics.includes(args.item))
                        args.prefillModifiers.modifier -= 10
                }
                else if (args.type == "skill")
                {
                    if (applicableCharacteristics.includes(args.item.data.characteristic.value))
                        args.prefillModifiers.modifier -= 10
                }`,
                "otherEffects" : ["blight", "wounded"]
            }
        }
    },
    "flux": {
        label: "Flux",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "symptom" : true
            }
        }
    },
    "lingering": {
        label: "Lingering",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "symptom" : true
            }
        }
    },
    "coughsAndSneezes": {
        label: "Coughs and Sneezes",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "symptom" : true
            }
        }
    },
    "gangrene": {
        label: "Gangrene",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "prefillDialog",
                "symptom" : true,
                "script": `
                    if (args.type == "characteristic" && args.item == "fel")
                    {
                        if (args.item == "fel")
                            args.prefillModifiers.modifier -= 10
                    }
                    else if (args.type == "skill")
                    {
                        if (args.item.data.characteristic.value == "fel")
                            args.prefillModifiers.modifier -= 10
                    }
                }`
            }
        }
    },
    "malaise": {
        label: "malaise",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "prepareData",
                "symptom" : true,
                "script": `
                if (game.user.isGM)
                {
                    let fatigued = args.actor.hasCondition("fatigued")
                    if (!fatigued)
                    {
                        args.actor.addCondition("fatigued")
                        ui.notifications.notify("Fatigued added to " + args.actor.name + " which cannot be removed until the Malaise symptom is gone.")
                    }
                }
                `
            }
        }
    },
    "nausea": {
        label: "nausea",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "rollTest",
                "symptom" : true,
                "script": `
                if (this.actor.owner && args.result.result == "failure")
                {
                    let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]
                    if (applicableCharacteristics.includes(result.characteristic))
                        this.actor.addCondition("stunned")
                    else if (result.skill && applicableCharacteristics.includes(result.skill.data.characteristic.value))
                        this.actor.addCondition("stunned")
                    else if (result.weapon)
                        this.actor.addCondition("stunned")

                }
                `
            }
        }
    },
    "pox": {
        label: "Pox",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "prefillDialog",
                "symptom" : true,
                "script": `
                   
                    if (args.type == "characteristic" && args.item == "fel")
                            args.prefillModifiers.modifier -= 10
                    else if (args.type == "skill")
                    {
                        if (args.item.data.characteristic.value == "fel")
                            args.prefillModifiers.modifier -= 10
                    }
                }`
            }
        }
    },
    "wounded": {
        label: "Wounded",
        icon: "modules/wfrp4e-core/icons/diseases/disease.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "invoke",
                "symptom" : true,
                "script": `
                    if (args.actor.owner)
                    {
                        args.actor.setupSkill("Endurance", {absolute: {difficulty : "average"}}).then(setupData => {
                            args.actor.basicTest(setupData).then(test => 
                                {
                                    if (test.result.result == "failure")
                                        fromUuid("Compendium.wfrp4e-core.diseases.kKccDTGzWzSXCBOb").then(disease => {
                                            args.actor.createEmbeddedEntity("OwnedItem", disease.data)
                                        })
                                })
                            })
                    }`
            }
        }
    }
},


// Condition Types
WFRP4E.magicLoreEffects = {
    "beasts": {
        label: "Lore of Beasts",
        icon: "modules/wfrp4e-core/icons/spells/beasts.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "invoke",
                "lore" : true,
                "script": `
                    if (args.actor.owner)
                    {
                        args.actor.setupSkill("Endurance", {absolute: {difficulty : "average"}}).then(setupData => {
                            args.actor.basicTest(setupData).then(test => 
                                {
                                    if (test.result.result == "failure")
                                        fromUuid("Compendium.wfrp4e-core.diseases.kKccDTGzWzSXCBOb").then(disease => {
                                            args.actor.createEmbeddedEntity("OwnedItem", disease.data)
                                        })
                                })
                            })
                    }`
            }
        }
    },
    "death": {
        label: "Lore of Death",
        icon: "modules/wfrp4e-core/icons/spells/death.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "apply",
                "effectTrigger": "immediate",
                "lore" : true,
                "script": `
                    if (args.actor.owner)
                    {
                        args.actor.addCondition("fatigued")
                    }`
            }
        }
    },
    "fire": {
        label: "Lore of Fire",
        icon: "modules/wfrp4e-core/icons/spells/fire.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "apply",
                "effectTrigger": "immediate",
                "lore" : true,
                "script": `
                    if (args.actor.owner)
                    {
                        args.actor.addCondition("ablaze")
                    }`
            }
        }
    },
    "heavens": {
        label: "Lore of Heavens",
        icon: "modules/wfrp4e-core/icons/spells/heavens.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "item",
                "effectTrigger": "damage",
                "lore" : true,
                "script": `
                    if (args.actor.owner)
                    {

                        let metalValue = 0;
                        for (let layer of AP.layers) {
                            if (layer.metal)
                            {
                                metalValue += layer.metal
                            }
                        }

                        args.totalWoundLoss += metalValue
                        let newUsed = AP.used - metalValue;

                        let apIndex = args.messageElements.findIndex(i => i.includes(game.i18n.localize("AP")))
                        args.messageElements[index] = AP.used + "/" + AP.value + " " + \$\{game.i18n.localize("AP")\}
                    }`
            }
        }
    },
    "metal": {
        label: "Lore of Metal",
        icon: "modules/wfrp4e-core/icons/spells/metal.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "item",
                "effectTrigger": "damage",
                "lore" : true,
                "script": `
                    if (args.actor.owner)
                    {
                        let apUsed = args.AP.used;


                        let metalValue = 0;
                        for (let layer of AP.layers) {
                            if (layer.metal)
                            {
                                metalValue += layer.metal
                            }
                        }

                        args.totalWoundLoss += metalValue * 2
                        let newUsed = AP.used - (metalValue * 2);

                        let apIndex = args.messageElements.findIndex(i => i.includes(game.i18n.localize("AP")))
                        args.messageElements[index] = newUsed + "/" + AP.value + " " + \$\{game.i18n.localize("AP")\}
                    }`
            }
        }
    },
    "life": {
        label: "Lore of Life",
        icon: "modules/wfrp4e-core/icons/spells/life.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "item",
                "effectTrigger": "damage",
                "lore" : true,
                "script": `
                    if (args.actor.owner)
                    {
                        if (!args.actor.has(game.i18n.localize("NAME.Daemonic")) && !args.actor.has(game.i18n.localize("NAME.Undead")))
                        {
                            let bleeding = args.actor.hasCondition("bleeding")
                            let fatigued = args.actor.hasCondition("fatigued")
                            if (bleeding) args.actor.removeCondition("bleeding", bleeding.flags.wfrp4e.value)
                            if (fatigued) args.actor.removeCondition("fatigued", fatigued.flags.wfrp4e.value)
                        }
                        else if (args.actor.has(game.i18n.localize("NAME.Undead")))
                        {
                            args.totalWoundLoss += actor.data.data.characetristics.wp.bonus;
                        }
                    }`
            }
        }
    },
    "light": {
        label: "Lore of Light",
        icon: "modules/wfrp4e-core/icons/spells/light.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "item",
                "effectTrigger": "damage",
                "lore" : true,
                "script": `
                if (args.actor.owner)
                {
                    args.actor.addCondition("blinded")

                    if (args.actor.has(game.i18n.localize("NAME.Undead")) || args.actor.has(game.i18n.localize("NAME.Daemonic")))
                    {
                        args.totalWoundLoss += actor.data.data.characetristics.int.bonus;
                    }
                }`
            }
        }
    },
    "shadow": {
        label: "Lore of Shadow",
        icon: "modules/wfrp4e-core/icons/spells/shadow.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "item",
                "effectTrigger": "damage",
                "lore" : true,
                "script": `
                if (args.actor.owner)
                {
                    let apUsed = args.AP.used;

                    args.totalWoundLoss += AP.used;
                    let apIndex = args.messageElements.findIndex(i => i.includes(game.i18n.localize("AP")))
                    args.messageElements[index] = "0/" + AP.value + " " + \$\{game.i18n.localize("AP")\}
                }`
            }
        }
    },
    "hedgecraft": {
        label: "Lore of Hedgecraft",
        icon: "modules/wfrp4e-core/icons/spells/hedgecraft.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "invoke",
                "lore" : true,
                "script": ``
            }
        }
    },
    "witchcraft": {
        label: "Lore of Witchcraft",
        icon: "modules/wfrp4e-core/icons/spells/witchcraft.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "apply",
                "effectTrigger": "immediate",
                "lore" : true,
                "script": `
                    if (args.actor.owner)
                    {
                        args.actor.addCondition("bleeding")
                    }`
            }
        }
    },
    "daemonology": {
        label: "Lore of Daemonology",
        icon: "modules/wfrp4e-core/icons/spells/daemonology.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "invoke",
                "lore" : true,
                "script": ``
            }
        }
    },
    "necromancy": {
        label: "Lore of Necromancy",
        icon: "modules/wfrp4e-core/icons/spells/necromancy.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "invoke",
                "lore" : true,
                "script": ``
            }
        }
    },
    "nurgle": {
        label: "Lore of Nurgle",
        icon: "modules/wfrp4e-core/icons/spells/nurgle.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "invoke",
                "lore" : true,
                "script": ``
            }
        }
    },
    "slaanesh": {
        label: "Lore of Slaanesh",
        icon: "modules/wfrp4e-core/icons/spells/slaanesh.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "actor",
                "effectTrigger": "invoke",
                "lore" : true,
                "script": ``
            }
        }
    },
    "tzeentch": {
        label: "Lore of Tzeentch",
        icon: "modules/wfrp4e-core/icons/spells/tzeentch.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectApplication": "apply",
                "effectTrigger": "immediate",
                "lore" : true,
                "script": `
                   if (args.actor.owner)
                      args.actor.setupSkill("Endurance", {context : {failure: "1 Corruption Point Gained", success : "1 Fortune Point Gained"}}).then(setupData => {
                          args.actor.basicTest(setupData).then(test => 
                           {
                               if (test.result.result == "success" && args.actor.data.type == "character")
                               {
                                   args.actor.update({"data.status.fortune.value" : args.actor.data.data.status.fortune.value + 1})
                               }
                               else if (test.result.result == "failure" && args.actor.data.type == "character")
                               {
                                args.actor.update({"data.status.corruption.value" : args.actor.data.data.status.corruption.value + 1})
                               }
                           })
                        })`
            }
        }
    },
};

WFRP4E.effectApplication = {
    "actor" : "Actor",
    "equipped" : "When Item equipped",
    "apply" : "Apply with targeting",
    "damage" : "Apply when Item applies damage",
}

WFRP4E.applyScope = {
    "actor" : "Actor",
    "item" : "Item"
}

WFRP4E.effectTriggers = {
    "invoke" : "Manually Invoked",
    "oneTime" : "Immediate",
    "dialogChoice" : "Dialog Choice",
    "prefillDialog" : "Prefill Dialog",
    "prePrepareData" : "Pre-Prepare Data",
    "prePrepareItems" : "Pre-Prepare ACtor Items",
    "prepareData" : "Prepare Data",
    "preWoundCalc" : "Pre-Wound Calculation",
    "woundCalc" : "Wound Calculation",
    "applyDamage" : "Apply Damage",
    "preTakeDamage" : "Pre-Take Damage",
    "takeDamage" : "Take Damage",
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
    "endTurn" : "End Turn",
    "endRound" : "End Round",
    "endCombat" : "End Combat"
}

WFRP4E.effectPlaceholder = {
    "dialogChoice" : "Dialog Choice",
    "prefillDialog" : 

    `args:

    prefillModifiers : {modifier, difficulty, slBonus, successBonus}
    type: string, 'weapon', 'skill' 'characteristic', etc.
    item: the item used of the aforementioned type
    options: other details about the test (options.rest or options.mutate for example)
    
    Example: 
    if (args.type == "skill" && args.item.name == "Athletics") args.prefillModifiers.modifier += 10`,

    "oneTime" : 
    
    `args:

    actor : actor who owns the effect
    `,

    "prePrepareData" : "Pre-Prepare Data",
    "prepareData" : "Prepare Data",
    "preWoundCalc" : "Pre-Wound Calculation",
    "woundCalc" : "Wound Calculation",
    "applyDamage" : "Apply Damage",
    "takeDamage" : 

    `args:

    actor : actor that's taking damage
    opposeData: data abobut the opposed test
    totalWoundLoss: total amount of wounds lost after calculation
    updateMsg: String that gets displayed in the damage card
    messageElements: placed in updateMsg that shows all the elements that reduced damage`,

    "preApplyCondition" : "Pre-Apply Condition",
    "applyCondition" : "Apply Condition",
    "prePrepareItem" : "Pre-Prepare Item",
    "prepareItem" : "Prepare Item",
    "rollTest" : "Roll Test",
    "rollIncomeTest" : "Roll Income Test",
    "rollWeaponTest" : "Roll Weapon Test",
    "rollCastTest" : "Roll Casting Test",
    "rollChannellingTest" : "Roll Channelling Test",
    "rollPrayerTest" : "Roll Prayer Test",
    "rollTraitTest" : "Roll Trait Test",
    "calculateOpposedDamage" : "Calculate Opposed Damage",
    "targetPrefillDialog" : "Prefill Targeter's Dialog",
    "endTurn" : "End Turn",
    "endRound" : "End Round",
    "endCombat" : "End Combat"
}

CONFIG.statusEffects = WFRP4E.statusEffects;

export default WFRP4E
