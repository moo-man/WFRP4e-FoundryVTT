const WFRP4E = {}

CONFIG.ChatMessage.template = "systems/wfrp4e/templates/chat/chat-message.html"

WFRP4E.creditOptions = {
    SPLIT : "split",
    EACH : "each",
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
    "ag": "CHABonus.Ag",
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

WFRP4E.encumbrancePenalties = {
    "encumbered": "WFRP4E.EncumbrancePenalties.Encumbered",
    "veryEncumbered": "WFRP4E.EncumbrancePenalties.VeryEnc",
    "maxEncumbered": "WFRP4E.EncumbrancePenalties.MaxEnc",
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

const DAMAGE_TYPE = {
    NORMAL: 0,
    IGNORE_AP: 1,
    IGNORE_TB: 2,
    IGNORE_ALL: 3
}

const PSEUDO_ENTITIES = [
	"Table",
	"Condition",
	"Symptom",
	"Roll",
	"Pay"
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

