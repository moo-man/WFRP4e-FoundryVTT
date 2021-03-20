const WFRP4E = {}
CONFIG.ChatMessage.template = "systems/wfrp4e/templates/chat/chat-message.html"

WFRP4E.creditOptions = {
    SPLIT: "split",
    EACH: "each",
}

WFRP4E.toTranslate = [
"statusTiers",
"characteristics",
"characteristicsAbbrev",
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
"difficultyLabels",
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
"extendedTestCompletion"
]

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
WFRP4E.loreEffectDescriptions = {};
WFRP4E.loreEffects = {};
WFRP4E.conditionDescriptions = {}
WFRP4E.symptoms = {}
WFRP4E.symptomDescriptions = {}
WFRP4E.symptomTreatment = {}
WFRP4E.conditionDescriptions = {}
WFRP4E.modTypes = {}
WFRP4E.symptomEffects = {}
WFRP4E.trade = {}

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
    none: "ExtendedTest.None",
    reset: "ExtendedTest.Reset",
    remove: "ExtendedTest.Remove"
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
            damage: { value: "SB + 1" },
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
        name : "Fear",
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
                    core : {
                        statusId : "fear"
                    },
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

    },

    terror: {

        label: "Terror",
        icon: "systems/wfrp4e/icons/conditions/terror.png",
        transfer: true,
        flags: {
            wfrp4e: {
                "effectTrigger": "oneTime",
                "effectApplication": "actor",
                "terrorValue": 1,
                "script": `
                    args.actor.setupSkill("Cool").then(setupData =>{
                    args.actor.basicTest(setupData).then(test => {
                        if (test.result.result == "failure")
                        {
                            let terror = this.effect.flags.wfrp4e.terrorValue 
                
                            if (test.result.SL < 0)
                                terror += Math.abs(test.result.SL)
                            args.actor.addCondition("broken", terror)
                        }
                        args.actor.applyFear(value, name)
                        })
                    })`
            }
        }
    }
}


WFRP4E.systemEffects = {
    "enc1" : {
        label: "Encumbrance 1",
        icon: "",
        flags: {
            wfrp4e: {
                "effectTrigger": "prePrepareData",
                "effectApplication": "actor",
                "script": `
                    args.actor.data.data.characteristics.ag.modifier -= 10;
                    args.actor.data.data.details.move.value -= 1;
                    if (args.actor.data.data.details.move.value < 3)
                        args.actor.data.data.details.move.value = 3`
            }
        }
    },
    "enc2" : {
        label: "Encumbrance 2",
        icon: "",
        flags: {
            wfrp4e: {
                "effectTrigger": "prePrepareData",
                "effectApplication": "actor",
                "script": `
                    args.actor.data.data.characteristics.ag.modifier -= 20;
                    args.actor.data.data.details.move.value -= 2;
                    if (args.actor.data.data.details.move.value < 2)
                        args.actor.data.data.details.move.value = 2`
            }
        }
    },
    "enc3" : {
        label: "Encumbrance 3",
        icon: "",
        flags: {
            wfrp4e: {
                "effectTrigger": "prePrepareData",
                "effectApplication": "actor",
                "script": `
                    args.actor.data.data.details.move.value = 0;`
            }
        }
    },
    "cold1" : {
        label: "Cold Exposure 1",
        icon: "",
        changes : [
            {key : "data.characteristics.bs.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ag.modifier", mode: 2, value: -10},
            {key : "data.characteristics.dex.modifier", mode: 2, value: -10},
        ],
        flags: {
            wfrp4e: {
                "effectTrigger": "",
                "effectApplication": "actor",
                "script": ``
            }
        }
    },
    "cold2" : {
        label: "Cold Exposure 2",
        icon: "",
        changes : [
            {key : "data.characteristics.bs.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ag.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ws.modifier", mode: 2, value: -10},
            {key : "data.characteristics.s.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.modifier", mode: 2, value: -10},
            {key : "data.characteristics.i.modifier", mode: 2, value: -10},
            {key : "data.characteristics.dex.modifier", mode: 2, value: -10},
            {key : "data.characteristics.int.modifier", mode: 2, value: -10},
            {key : "data.characteristics.wp.modifier", mode: 2, value: -10},
            {key : "data.characteristics.fel.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
        ],
        flags: {
            wfrp4e: {
                "effectTrigger": "",
                "effectApplication": "actor",
                "script": ``
            }
        }
    },
    "cold3" : {
        label: "Cold Exposure 3",
        icon: "",
        flags: {
            wfrp4e: {
                "effectTrigger": "oneTime",
                "effectApplication": "actor",
                "script": `
                    let tb = this.actor.data.data.characteristics.t.bonus
                    let damage = new Roll("1d10").roll().total
                    damage -= tb
                    if (damage <= 0) damage = 1
                    if (this.actor.data.data.status.wounds.value <= damage)
                    {
                        this.actor.addCondition("unconscious")
                    }
                    this.actor.modifyWounds(-damage)
                    ui.notifications.notify("Took " + damage + " Damage")
                `
            }
        }
    },
    "heat1" : {
        label: "Heat Exposure 1",
        icon: "",
        changes : [
            {key : "data.characteristics.int.modifier", mode: 2, value: -10},
            {key : "data.characteristics.wp.modifier", mode: 2, value: -10},
            {key : "data.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
        ],
        flags: {
            wfrp4e: {
                "effectTrigger": "",
                "effectApplication": "actor",
                "script": ``
            }
        }
    },
    "heat2" : {
        label: "Heat Exposure 2",
        icon: "",
        changes : [
            {key : "data.characteristics.bs.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ag.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ws.modifier", mode: 2, value: -10},
            {key : "data.characteristics.s.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.modifier", mode: 2, value: -10},
            {key : "data.characteristics.i.modifier", mode: 2, value: -10},
            {key : "data.characteristics.dex.modifier", mode: 2, value: -10},
            {key : "data.characteristics.int.modifier", mode: 2, value: -10},
            {key : "data.characteristics.wp.modifier", mode: 2, value: -10},
            {key : "data.characteristics.fel.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
        ],
        flags: {
            wfrp4e: {
                "effectTrigger": "",
                "effectApplication": "actor",
                "script": ``
            }
        }
    },
    "heat3" : {
        label: "Heat Exposure 3",
        icon: "",
        flags: {
            wfrp4e: {
                "effectTrigger": "oneTime",
                "effectApplication": "actor",
                "script": `
                    let tb = this.actor.data.data.characteristics.t.bonus
                    let damage = new Roll("1d10").roll().total
                    damage -= tb
                    if (damage <= 0) damage = 1
                    this.actor.modifyWounds(-damage)
                    ui.notifications.notify("Took " + damage + " Damage")
                `
            }
        }
    },
    "thirst1" : {
        label: "Thirst 1",
        icon: "",
        changes : [
            {key : "data.characteristics.int.modifier", mode: 2, value: -10},
            {key : "data.characteristics.wp.modifier", mode: 2, value: -10},
            {key : "data.characteristics.fel.modifier", mode: 2, value: -10},
            {key : "data.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
        ],
        flags: {
            wfrp4e: {
                "effectTrigger": "",
                "effectApplication": "actor",
                "script": ``
            }
        }
    },
    "thirst2" : {
        label: "Thirst 2+",
        icon: "",
        changes : [
            {key : "data.characteristics.bs.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ag.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ws.modifier", mode: 2, value: -10},
            {key : "data.characteristics.s.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.modifier", mode: 2, value: -10},
            {key : "data.characteristics.i.modifier", mode: 2, value: -10},
            {key : "data.characteristics.int.modifier", mode: 2, value: -10},
            {key : "data.characteristics.dex.modifier", mode: 2, value: -10},
            {key : "data.characteristics.wp.modifier", mode: 2, value: -10},
            {key : "data.characteristics.fel.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
        ],
        flags: {
            wfrp4e: {
                "effectTrigger": "invoke",
                "effectApplication": "actor",
                "script": `
                let tb = this.actor.data.data.characteristics.t.bonus
                let damage = new Roll("1d10").roll().total
                damage -= tb
                if (damage <= 0) damage = 1
                this.actor.modifyWounds(-damage)
                ui.notifications.notify("Took " + damage + " Damage")
            `
            }
        }
    },
    "starvation1" : {
        label: "Starvation 1",
        icon: "",
        changes : [
            {key : "data.characteristics.s.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
        ],
        flags: {
            wfrp4e: {
                "effectTrigger": "",
                "effectApplication": "actor",
                "script": ``
            }
        }
    },
    "starvation2" : {
        label: "Starvation 2",
        icon: "",
        changes : [
            {key : "data.characteristics.bs.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ag.modifier", mode: 2, value: -10},
            {key : "data.characteristics.ws.modifier", mode: 2, value: -10},
            {key : "data.characteristics.s.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.modifier", mode: 2, value: -10},
            {key : "data.characteristics.i.modifier", mode: 2, value: -10},
            {key : "data.characteristics.int.modifier", mode: 2, value: -10},
            {key : "data.characteristics.dex.modifier", mode: 2, value: -10},
            {key : "data.characteristics.wp.modifier", mode: 2, value: -10},
            {key : "data.characteristics.fel.modifier", mode: 2, value: -10},
            {key : "data.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
            {key : "data.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
        ],
        flags: {
            wfrp4e: {
                "effectTrigger": "invoke",
                "effectApplication": "actor",
                "script": `
                let tb = this.actor.data.data.characteristics.t.bonus
                let damage = new Roll("1d10").roll().total
                damage -= tb
                if (damage <= 0) damage = 1
                this.actor.modifyWounds(-damage)
                ui.notifications.notify("Took " + damage + " Damage")
            `
            }
        }
    },
    "infighting" : {
        label: "Infighting",
        icon: "",
        flags: {
            wfrp4e: {
                "effectTrigger": "prefillDialog",
                "effectApplication": "actor",
                "script": `//TODO` 
            }
        }
    },
    "defensive" : {
        label: "On the Defensive [Skill Name]",
        icon: "",
        flags: {
            wfrp4e: {
                "effectTrigger": "prefillDialog",
                "effectApplication": "actor",
                "script": `
                    let skillName = this.effect.label.substring(this.effect.label.indexOf("[") + 1, this.effect.label.indexOf("]"))
                    if (!this.actor.data.flags.oppose)
                      return
                    if ((args.type == "skill" && args.item.name == skillName) ||
                        (args.type == "weapon" && args.item.skillToUse.name == skillName) ||
                        (args.type == "cast" && skillName == "Language (Magick)") ||
                        (args.type == "prayer" && skillName == "Prayer") || 
                        (args.type == "trait" && args.item.data.rollable.skill == skillName))
                        args.prefillModifiers.modifier += 20` 
            }
        }
    },
    "dualwielder" : {
        label: "Dual Wielder",
        icon: "",
        flags: {
            wfrp4e: {
                "effectTrigger": "prefillDialog",
                "effectApplication": "actor",
                "script": `
                    if (this.actor.data.flags.oppose)
                        args.prefillModifiers.modifier -= 10` 
            }
        }
    }
}


WFRP4E.conditionScripts = {
    "ablaze" : async function (actor) {
        let effect = actor.hasCondition("ablaze")
        let value = effect.flags.wfrp4e.value;

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
        value = effect.flags.wfrp4e.value;
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
    startCombat : {
        fearTerror : function(combat) {
            if(!game.user.isUniqueGM)
                return 

            let fearCounters = []
            let terrorCounters = [];
            for(let turn of combat.turns) 
            {
                let fear = turn.actor.has(game.i18n.localize("CHAT.Fear"))
                if (fear)
                    fearCounters.push({name : turn.name, value : `@Fear[${fear.data.specification.value},${turn.name}]`})                    

                let terror = turn.actor.has(game.i18n.localize("CHAT.Terror"))
                if (terror)
                    terrorCounters.push({name : turn.name, value : `@Terror[${terror.data.specification.value},${turn.name}]`})    
            }
            if (fearCounters.length || terrorCounters.length)
            {
                let msg = ""
                if (fearCounters.length)
                    msg += `<h2>${game.i18n.localize("CHAT.Fear")}</h2>${fearCounters.map(f => `${f.name} - ${f.value}`).join("<br>")}`
                if (terrorCounters.length)
                    msg += `<h2>${game.i18n.localize("CHAT.Terror")}</h2>${terrorCounters.map(t => `${t.name} - ${t.value}`).join("<br>")}`
                
                ChatMessage.create({content: msg})
            }
        }
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
    "prePrepareItems" : "Pre-Prepare Actor Items",
    "prepareData" : "Prepare Data",
    "preWoundCalc" : "Pre-Wound Calculation",
    "woundCalc" : "Wound Calculation",
    "preApplyDamage" : "Pre-Apply Damage",
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
    "getInitiativeFormula" : "Get Initiative",
    "endTurn" : "End Turn",
    "endRound" : "End Round",
    "endCombat" : "End Combat"
}

WFRP4E.effectPlaceholder = {

    "invoke" : 
    `This effect is only applied when the Invoke button is pressed.
    args:

    none`,
    "oneTime" : 
    `This effect happens once, immediately when applied.
    args:

    actor : actor who owns the effect
    `,
    "prefillDialog" : 
    `This effect is applied before rendering the roll dialog, and is meant to change the values prefilled in the bonus section
    args:

    prefillModifiers : {modifier, difficulty, slBonus, successBonus}
    type: string, 'weapon', 'skill' 'characteristic', etc.
    item: the item used of the aforementioned type
    options: other details about the test (options.rest or options.mutate for example)
    
    Example: 
    if (args.type == "skill" && args.item.name == "Athletics") args.prefillModifiers.modifier += 10`,

    "prePrepareData" : 
    `This effect is applied before any actor data is calculated.
    args:

    actor : actor who owns the effect
    `,

    "prePrepareItems" : 
    `This effect is applied before items are sorted and calculated

    actor : actor who owns the effect
    `,

    "prepareData" : 
    `This effect is applied after actor data is calculated and processed.

    args:

    actor : actor who owns the effect
    `,

    "preWoundCalc" : 
    `This effect is applied right before wound calculation, ideal for swapping out characteristics or adding multipiliers

    actor : actor who owns the effect
    sb : Strength Bonus
    tb : Toughness Bonus
    wpb : Willpower Bonus
    multiplier : {
        sb : SB Multiplier
        tb : TB Multiplier
        wpb : WPB Modifier
    }

    e.g. for Hardy: "args.multiplier.tb += 1"
    `,

    "woundCalc" : 
    `This effect happens after wound calculation, ideal for multiplying the result.

    args:

    actor : actor who owns the effect
    wounds : wounds calculated

    e.g. for Swarm: "wounds *= 5"
    `,

    "preApplyDamage" : 
    `This effect happens before applying damage in an opposed test

    args:

    actor : actor who is taking damage
    attacker : actor who is attacking
    opposeData : object that details the opposed result 
    damageType : damage type selected (ignore TB, AP, etc.)
    `,
    "applyDamage" : 
    `This effect happens after damage in an opposed test is calculated, but before actor data is updated.

    args:

    actor : actor who is taking damage
    attacker : actor who is attacking
    opposeData : object that details the opposed result 
    damageType : damage type selected (ignore TB, AP, etc.)
    totalWoundLoss : Wound loss after mitigations
    AP : data about the AP used
    updateMsg : starting string for damage update message
    messageElements : arary of strings used to show how damage mitigation was calculated
    `,

    "preTakeDamage" : 
    `This effect happens before taking damage in an opposed test

    args:

    actor : actor who is taking damage
    attacker : actor who is attacking
    opposeData : object that details the opposed result 
    damageType : damage type selected (ignore TB, AP, etc.)
    `,
    
    "takeDamage" : 
    `This effect happens after damage in an opposed test is calculated, but before actor data is updated.

    args:

    actor : actor who is taking damage
    attacker : actor who is attacking
    opposeData : object that details the opposed result 
    damageType : damage type selected (ignore TB, AP, etc.)
    totalWoundLoss : Wound loss after mitigations
    AP : data about the AP used
    updateMsg : starting string for damage update message
    messageElements : arary of strings used to show how damage mitigation was calculated
    `,

    "preApplyCondition" :  
    `This effect happens before effects of a condition are applied.

    args:

    effect : condition being applied
    data : {
        msg : Chat message about the application of the condition
        <other data, possibly condition specific>
    }
    `,

    "applyCondition" :  
    `This effect happens after effects of a condition are applied.

    args:

    effect : condition being applied
    data : {
        messageData : Chat message about the application of the condition
        <other data, possibly condition specific>
    }
    `,
    "prePrepareItem" : 
    `This effect is applied before an item is processed with actor data.

    args:

    item : item being processed
    `,
    "prepareItem" : 
    `This effect is applied after an item is processed with actor data.

    args:

    item : item processed
    `,
    "preRollTest": 
    `This effect is applied before a test is calculated.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,
    "preRollWeaponTest" :  
    `This effect is applied before a weapon test is calculated.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "preRollCastTest" :  
    `This effect is applied before a casting test is calculated.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "preChannellingTest" :  
    `This effect is applied before a channelling test is calculated.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "preRollPrayerTest" :  
    `This effect is applied before a prayer test is calculated.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "preRollTraitTest" :  
    `This effect is applied before a trait test is calculated.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollTest" : 
    `This effect is applied after a test is calculated.

    args:

    result: result data from the test calculation
    cardOptions: Data for the card display, title, template, etc
    `,
    "rollIncomeTest" : 
    `This effect is applied after an income test is calculated.

    args:

    result: result data from the test calculation
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollWeaponTest" : 
    `This effect is applied after a weapon test is calculated.

    args:

    result: result data from the test calculation
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollCastTest" : 
    `This effect is applied after a casting test is calculated.

    args:

    result: result data from the test calculation
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollChannellingTest" : 
    `This effect is applied after a channelling test is calculated.

    args:

    result: result data from the test calculation
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollPrayerTest" : 
    `This effect is applied after a prayer test is calculated.

    args:

    result: result data from the test calculation
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollTraitTest" : 
    `This effect is applied after a trait test is calculated.

    args:

    result: result data from the test calculation
    cardOptions: Data for the card display, title, template, etc
    `,

    "preOpposedAttacker" : 
    `This effect is applied before an opposed test result begins calculation, as the attacker.

    args:

    attackerTest: test result of the attacker
    defenderTest: test result of the defender
    opposeResult: opposeResult object, before calculation
    `,
    "preOpposedDefender" : 
    `This effect is applied before an opposed test result begins calculation, as the defender.

    args:

    attackerTest: test result of the attacker
    defenderTest: test result of the defender
    opposeResult: opposeResult object, before calculation
    `,

    "opposedAttacker" : 
    `This effect is applied after an opposed test result begins calculation, as the attacker.

    args:

    attackerTest: test result of the attacker
    defenderTest: test result of the defender
    opposeResult: opposeResult object, after calculation
    `,

    "opposedDefender" : 
    `This effect is applied before an opposed test result begins calculation, as the defender.

    args:

    attackerTest: test result of the attacker
    defenderTest: test result of the defender
    opposeResult: opposeResult object, after calculation
    `,

    "calculateOpposedDamage" : 
    `This effect is applied during an opposed test damage calculation. This effect runs on the attacking actor

    args:

    damage : initial damage calculation before multipliers
    damageMultiplier : multiplier calculated based on size difference
    sizeDiff : numeric difference in sized, will then be used to add damaging/impact
    opposeResult: details about the opposed result
    `,

    "getInitiativeFormula" : 
    `This effect runs when determining actor's initiative

    args:

    initiative: Calculated initiative value
    `,

    "targetPrefillDialog" : 
    `This effect is applied to another actor whenever they target this actor, and is meant to change the values prefilled in the bonus section
    args:

    prefillModifiers : {modifier, difficulty, slBonus, successBonus}
    type: string, 'weapon', 'skill' 'characteristic', etc.
    item: the item used of the aforementioned type
    options: other details about the test (options.rest or options.mutate for example)
    
    Example: 
    if (args.type == "skill" && args.item.name == "Athletics") args.prefillModifiers.modifier += 10`,

    "endTurn" : 
    `This effect runs at the end of an actor's turn

    args:

    combat: current combat
    `,

    "endRound" :  
    `This effect runs at the end of a round

    args:

    combat: current combat
    `,
    "endCombat" :  
    `This effect runs when combat has ended

    args:

    combat: current combat
    `,

    "this" : 
    `
    
    All effects have access to: 
        this.actor : actor running the effect
        this.effect : effect being executed
        this.item : item that has the effect, if effect comes from an item`

   
    

}

CONFIG.statusEffects = WFRP4E.statusEffects;

export default WFRP4E
