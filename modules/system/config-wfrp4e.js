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
"effectApplication",
"applyScope",
"weaponGroupDescriptions",
"qualityDescriptions",
"flawDescriptions",
"loreEffectDescriptions",
"conditionDescriptions",
"symptomDescriptions",
"classTrappings"
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
    "other": "WFRP4E.ArmourType.Other"
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
    "fear": "WFRP4E.ConditionName.Fear",
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
WFRP4E.speciesMovement = {}
WFRP4E.speciesFate = {}
WFRP4E.speciesRes = {}
WFRP4E.speciesExtra = {}
WFRP4E.speciesAge = {}
WFRP4E.speciesHeight = {}
WFRP4E.speciesCareerReplacements = {}
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

WFRP4E.premiumModules = {
    "wfrp4e" : "WFRP4e System",
    "wfrp4e-core" : "Core Rulebook",
    "wfrp4e-starter-set" : "Starter Set",
    "wfrp4e-rnhd" : "Rough Nights & Hard Days",
    "wfrp4e-eis" : "Enemy In Shadows",
    "wfrp4e-ua1" : "Ubersreik Adventures I",
    "wfrp4e-dotr" : "Death on the Reik",
    "wfrp4e-middenheim" : "Middenheim: City of the White Wolf",
    "wfrp4e-archives1" : "Archives of the Empire: Vol 1.",
    "wfrp4e-pbtt" : "Power Behind the Throne",
    "wfrp4e-altdorf" : "Altdorf: Crown of the Empire",
    "wfrp4e-ua2" : "Ubersreik Adventures II",
    "wfrp4e-owb1" : "Old World Bundle I",
    "wfrp4e-horned-rat" : "The Horned Rat",
    "wfrp4e-empire-ruins" : "Empire in Ruins",
    "wfrp4e-archives2" : "Archives of the Empire: Vol 2.",
    "wfrp4e-up-in-arms" : "Up In Arms",
    "wfrp4e-wom" : "Winds of Magic",
    "wfrp4e-zoo" : "Imperial Zoo",
    "wfrp4e-salzenmund" : "Salzenmund: City of Salt and Silver"
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

WFRP4E.actorSizeEncumbrance = {
    "tiny": 0,
    "ltl": 2,
    "sml": 5,
    "avg": 10,
    "lrg": 20,
    "enor": 40,
    "mnst": 100
}

// For modules to add to these, they need to be merged
WFRP4E.systemItems = {};
WFRP4E.systemEffects = {}
WFRP4E.groupAdvantageActions = [];

WFRP4E.PrepareSystemItems = function() {

    this.systemItems = mergeObject(this.systemItems, {
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
                specification: { value: "4" },
                rollable: { value: true, rollCharacteristic: "ws", bonusCharacteristic: "s", defaultDifficulty: "challenging", damage : true, skill : game.i18n.localize("NAME.MeleeBrawling") },
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
            name : game.i18n.localize("NAME.Fear"),
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
            effects:
                [{
                    name: game.i18n.localize("NAME.Fear"),
                    icon: "systems/wfrp4e/icons/conditions/fear.png",
                    transfer: true,
                    statuses : ["fear"],
                    flags: {
                        wfrp4e: {
                            "effectTrigger": "dialogChoice",
                            "effectData": {
                                "description": game.i18n.localize("EFFECT.TestsToAffect"),
                                "slBonus": "-1"
                            },
                            "script": `
                                if (this.flags.wfrp4e.fearName)
                                    this.flags.wfrp4e.effectData.description += " " + this.flags.wfrp4e.fearName
                                else
                                    this.flags.wfrp4e.effectData.description += " " + game.i18n.localize("EFFECT.TheSourceOfFear")
                            `}
                    }
                }
                ]

        },

        terror: {

            name: game.i18n.localize("NAME.Terror"),
            icon: "systems/wfrp4e/icons/conditions/terror.png",
            transfer: true,
            flags: {
                wfrp4e: {
                    "effectTrigger": "oneTime",
                    "effectApplication": "actor",
                    "terrorValue": 1,
                    "script": `
                        let skillName = game.i18n.localize("NAME.Cool");
                        let test = await args.actor.setupSkill(skillName, {terror: true, appendTitle : " - Terror"});
                        await test.roll();
                        let terror = this.effect.flags.wfrp4e.terrorValue;   
                        await args.actor.applyFear(terror, name)
                        if (test.result.outcome == "failure")
                        {            
                            if (test.result.SL < 0)
                                terror += Math.abs(test.result.SL)
                    
                            args.actor.addCondition("broken", terror)
                        }
                    })`
                }
            }
        }
    })


    this.systemEffects = mergeObject(this.systemEffects, {
        "enc1" : {
            name: game.i18n.localize("EFFECT.Encumbrance") + " 1",
            icon: "systems/wfrp4e/icons/effects/enc1.png",
            statuses : ["enc1"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "prePrepareData",
                    "effectApplication": "actor",
                    "script": `
                        args.actor.characteristics.ag.modifier -= 10;
    
                        if (args.actor.details.move.value > 3)
                        {
                            args.actor.details.move.value -= 1;
                            if (args.actor.details.move.value < 3)
                                args.actor.details.move.value = 3
                        }
                        `
                }
            }
        },
        "enc2" : {
            name: game.i18n.localize("EFFECT.Encumbrance") + " 2",
            icon: "systems/wfrp4e/icons/effects/enc2.png",
            statuses : ["enc2"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "prePrepareData",
                    "effectApplication": "actor",
                    "script": `
                        args.actor.characteristics.ag.modifier -= 20;
                        if (args.actor.details.move.value > 2)
                        {
                            args.actor.details.move.value -= 2;
                            if (args.actor.details.move.value < 2)
                                args.actor.details.move.value = 2
                        }
                        `
                }
            }
        },
        "enc3" : {
            name: game.i18n.localize("EFFECT.Encumbrance") + " 3",
            icon: "systems/wfrp4e/icons/effects/enc3.png",
            statuses : ["enc3"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "prePrepareData",
                    "effectApplication": "actor",
                    "script": `
                        args.actor.details.move.value = 0;`
                }
            }
        },
        "cold1" : {
            name: game.i18n.localize("EFFECT.ColdExposure") + " 1",
            icon: "",
            statuses : ["cold1"],
            changes : [
                {key : "system.characteristics.bs.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ag.modifier", mode: 2, value: -10},
                {key : "system.characteristics.dex.modifier", mode: 2, value: -10},
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
            name: game.i18n.localize("EFFECT.ColdExposure") + " 2",
            icon: "",
            statuses : ["cold2"],
            changes : [
                {key : "system.characteristics.bs.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ag.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ws.modifier", mode: 2, value: -10},
                {key : "system.characteristics.s.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.modifier", mode: 2, value: -10},
                {key : "system.characteristics.i.modifier", mode: 2, value: -10},
                {key : "system.characteristics.dex.modifier", mode: 2, value: -10},
                {key : "system.characteristics.int.modifier", mode: 2, value: -10},
                {key : "system.characteristics.wp.modifier", mode: 2, value: -10},
                {key : "system.characteristics.fel.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
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
            name: game.i18n.localize("EFFECT.ColdExposure") + " 3",
            icon: "",
            statuses : ["cold3"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "invoke",
                    "effectApplication": "actor",
                    "script": `
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
            }
        },
        "heat1" : {
            name: game.i18n.localize("EFFECT.HeatExposure") + " 1",
            icon: "",
            statuses : ["heat1"],
            changes : [
                {key : "system.characteristics.int.modifier", mode: 2, value: -10},
                {key : "system.characteristics.wp.modifier", mode: 2, value: -10},
                {key : "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
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
            name: game.i18n.localize("EFFECT.HeatExposure") + " 2",
            icon: "",
            statuses : ["heat2"],
            changes : [
                {key : "system.characteristics.bs.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ag.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ws.modifier", mode: 2, value: -10},
                {key : "system.characteristics.s.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.modifier", mode: 2, value: -10},
                {key : "system.characteristics.i.modifier", mode: 2, value: -10},
                {key : "system.characteristics.dex.modifier", mode: 2, value: -10},
                {key : "system.characteristics.int.modifier", mode: 2, value: -10},
                {key : "system.characteristics.wp.modifier", mode: 2, value: -10},
                {key : "system.characteristics.fel.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
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
            name: game.i18n.localize("EFFECT.HeatExposure") + " 3",
            icon: "",
            statuses : ["heat3"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "invoke",
                    "effectApplication": "actor",
                    "script": `
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
            }
        },
        "thirst1" : {
            name: game.i18n.localize("EFFECT.Thirst") + " 1",
            icon: "",
            statuses : ["thirst1"],
            changes : [
                {key : "system.characteristics.int.modifier", mode: 2, value: -10},
                {key : "system.characteristics.wp.modifier", mode: 2, value: -10},
                {key : "system.characteristics.fel.modifier", mode: 2, value: -10},
                {key : "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
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
            name: game.i18n.localize("EFFECT.Thirst") + " 2+",
            icon: "",
            statuses : ["thirst2"],
            changes : [
                {key : "system.characteristics.bs.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ag.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ws.modifier", mode: 2, value: -10},
                {key : "system.characteristics.s.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.modifier", mode: 2, value: -10},
                {key : "system.characteristics.i.modifier", mode: 2, value: -10},
                {key : "system.characteristics.int.modifier", mode: 2, value: -10},
                {key : "system.characteristics.dex.modifier", mode: 2, value: -10},
                {key : "system.characteristics.wp.modifier", mode: 2, value: -10},
                {key : "system.characteristics.fel.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
            ],
            flags: {
                wfrp4e: {
                    "effectTrigger": "invoke",
                    "effectApplication": "actor",
                    "script": `
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
            }
        },
        "starvation1" : {
            name: game.i18n.localize("EFFECT.Starvation") + " 1",
            icon: "",
            statuses : ["starvation1"],
            changes : [
                {key : "system.characteristics.s.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
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
            name: game.i18n.localize("EFFECT.Starvation") + " 2",
            icon: "",
            statuses : ["starvation2"],
            changes : [
                {key : "system.characteristics.bs.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ag.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ws.modifier", mode: 2, value: -10},
                {key : "system.characteristics.s.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.modifier", mode: 2, value: -10},
                {key : "system.characteristics.i.modifier", mode: 2, value: -10},
                {key : "system.characteristics.int.modifier", mode: 2, value: -10},
                {key : "system.characteristics.dex.modifier", mode: 2, value: -10},
                {key : "system.characteristics.wp.modifier", mode: 2, value: -10},
                {key : "system.characteristics.fel.modifier", mode: 2, value: -10},
                {key : "system.characteristics.t.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.s.calculationBonusModifier", mode: 2, value: 1},
                {key : "system.characteristics.wp.calculationBonusModifier", mode: 2, value: 1},
            ],
            flags: {
                wfrp4e: {
                    "effectTrigger": "invoke",
                    "effectApplication": "actor",
                    "script": `
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
            }
        },
        "infighting" : {
            name: game.i18n.localize("EFFECT.Infighting"),
            icon: "modules/wfrp4e-core/icons/talents/in-fighter.png",
            statuses : ["infighting"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "prePrepareItem",
                    "effectApplication": "actor",
                    "script": `
                        if (args.item.type == "weapon" && args.item.isEquipped)
                        {
                            let weaponLength = args.item.reachNum
                            if (weaponLength > 3)
                            {
                                let improv = duplicate(game.wfrp4e.config.systemItems.improv)
                                improv.system.twohanded.value = args.item.twohanded.value
                                improv.system.offhand.value = args.item.offhand.value
                                improv.name = args.item.name + " (" + game.i18n.localize("EFFECT.Infighting") + ")"
                                mergeObject(args.item.system, improv.system, {overwrite : true})
                                args.item.system.qualities = improv.system.qualities
                                args.item.system.flaws = improv.system.flaws
                                args.item.name = improv.name
                                args.item.system.infighting = true;
                            }
                        }
                    `
                }
            }
        },
        "defensive" : {
            name: game.i18n.localize("EFFECT.OnDefensive"),
            icon: "",
            statuses : ["defensive"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "prefillDialog",
                    "effectApplication": "actor",
                    "script": `
                        let skillName = this.effect.name.substring(this.effect.name.indexOf("[") + 1, this.effect.name.indexOf("]"))
                        if (!this.actor.isOpposing)
                        return
                        if ((args.type == "skill" && args.item.name == skillName) ||
                            (args.type == "weapon" && args.item.skillToUse.name == skillName) ||
                            (args.type == "cast" && skillName == (game.i18n.localize("NAME.Language") + " (" + game.i18n.localize("SPEC.Magick") + ")")) ||
                            (args.type == "prayer" && skillName == game.i18n.localize("NAME.Pray")) || 
                            (args.type == "trait" && args.item.rollable.skill == skillName))
                            args.prefillModifiers.modifier += 20` 
                }
            }
        },
        "dualwielder" : {
            name: game.i18n.localize("EFFECT.DualWielder"),
            icon: "modules/wfrp4e-core/icons/talents/dual-wielder.png",
            statuses : ["dualwielder"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "prefillDialog",
                    "effectApplication": "actor",
                    "script": `
                        if (this.actor.isOpposing)
                            args.prefillModifiers.modifier -= 10` 
                }
            }
        },
        "consumealcohol1" : {
            name: game.i18n.localize("EFFECT.ConsumeAlcohol") + " 1",
            icon: "",
            statuses : ["consumealcohol1"],
            changes : [
                {key : "system.characteristics.bs.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ag.modifier", mode: 2, value: -10},
                {key : "system.characteristics.ws.modifier", mode: 2, value: -10},
                {key : "system.characteristics.int.modifier", mode: 2, value: -10},
                {key : "system.characteristics.dex.modifier", mode: 2, value: -10},
            ]
        },
        "consumealcohol2" : {
            name: game.i18n.localize("EFFECT.ConsumeAlcohol") + " 2",
            icon: "",
            statuses : ["consumealcohol2"],
            changes : [
                {key : "system.characteristics.bs.modifier", mode: 2, value: -20},
                {key : "system.characteristics.ag.modifier", mode: 2, value: -20},
                {key : "system.characteristics.ws.modifier", mode: 2, value: -20},
                {key : "system.characteristics.int.modifier", mode: 2, value: -20},
                {key : "system.characteristics.dex.modifier", mode: 2, value: -20},
            ]
        },
        "consumealcohol3" : {
            name: game.i18n.localize("EFFECT.ConsumeAlcohol") + " 3",
            icon: "",
            statuses : ["consumealcohol3"],
            changes : [
                {key : "system.characteristics.bs.modifier", mode: 2, value: -30},
                {key : "system.characteristics.ag.modifier", mode: 2, value: -30},
                {key : "system.characteristics.ws.modifier", mode: 2, value: -30},
                {key : "system.characteristics.int.modifier", mode: 2, value: -30},
                {key : "system.characteristics.dex.modifier", mode: 2, value: -30},
            ]
        },
        "stinkingdrunk1" : {
            name: game.i18n.localize("EFFECT.MarienburghersCourage"),
            icon: "",
            statuses : ["stinkingdrunk1"],
            flags: {
                wfrp4e: {
                    "effectTrigger": "prefillDialog",
                    "effectApplication": "actor",
                    "script": `
                        let skillName = game.i18n.localize("NAME.Cool")
                        if (args.type=="skill" && args.item.name==skillName)
                            args.prefillModifiers.modifier += 20` 
                }
            }
        }
    })

    this.statusEffects = [
        {
            icon: "systems/wfrp4e/icons/conditions/bleeding.png",
            id: "bleeding",
            statuses: ["bleeding"],
            name: "WFRP4E.ConditionName.Bleeding",
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
            statuses: ["poisoned"],
            name: "WFRP4E.ConditionName.Poisoned",
            flags: {
                wfrp4e: {
                    "trigger": "endRound",
                    "effectTrigger": "prefillDialog",
                    "script": "args.prefillModifiers.modifier -= 10 * this.effect.conditionValue",
                    "value": 1
                }
            }
            
        },
        {
            icon: "systems/wfrp4e/icons/conditions/ablaze.png",
            id: "ablaze",
            statuses: ["ablaze"],
            name: "WFRP4E.ConditionName.Ablaze",
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
            statuses: ["deafened"],
            name: "WFRP4E.ConditionName.Deafened",
            flags: {
                wfrp4e: {
                    "trigger": "endRound",
                    "effectTrigger": "dialogChoice",
                    "effectData" : {
                        "description" : game.i18n.localize("EFFECT.TestsRelatedToHearing"),
                        "modifier" : "-10 * this.flags.wfrp4e.value"
                    },
                    "value": 1
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/conditions/stunned.png",
            id: "stunned",
            statuses: ["stunned"],
            name: "WFRP4E.ConditionName.Stunned",
            flags: {
                wfrp4e: {
                    "trigger": "endRound",
                    "effectTrigger": "prefillDialog",
                    "script": "args.prefillModifiers.modifier -= 10 * this.effect.conditionValue",
                    "value": 1,
                    "secondaryEffect" :{
                        "effectTrigger": "targetPrefillDialog",
                        "script": "if (args.item && args.item.attackType=='melee') args.prefillModifiers.slBonus += 1",
                    }
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/conditions/entangled.png",
            id: "entangled",
            statuses: ["entangled"],
            name: "WFRP4E.ConditionName.Entangled",
            flags: {
                wfrp4e: {
                    "trigger": "endRound",
                    "effectTrigger": "dialogChoice",
                    "effectData" : {
                        "description" : game.i18n.localize("EFFECT.TestsRelatedToMovementOfAnyKind"),
                        "modifier" : "-10 * this.flags.wfrp4e.value"
                    },
                    "value": 1
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/conditions/fatigued.png",
            id: "fatigued",
            statuses: ["fatigued"],
            name: "WFRP4E.ConditionName.Fatigued",
            flags: {
                wfrp4e: {
                    "effectTrigger": "prefillDialog",
                    "script": "args.prefillModifiers.modifier -= 10 * this.effect.conditionValue",
                    "value" : 1
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/conditions/blinded.png",
            id: "blinded",
            statuses: ["blinded"],
            name: "WFRP4E.ConditionName.Blinded",
            flags: {
                wfrp4e: {
                    "trigger": "endRound",
                    "effectTrigger": "dialogChoice",
                    "effectData" : {
                        "description" : game.i18n.localize("EFFECT.TestsRelatedToSight"),
                        "modifier" : "-10 * this.flags.wfrp4e.value"
                    },
                    "value": 1,
                    "secondaryEffect" :{
                        "effectTrigger": "targetPrefillDialog",
                        "script": "if (args.item && args.item.attackType=='melee') args.prefillModifiers.modifier += 10 * this.effect.conditionValue",
                    }
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/conditions/broken.png",
            id: "broken",
            statuses: ["broken"],
            name: "WFRP4E.ConditionName.Broken",
            flags: {
                wfrp4e: {
                    "effectTrigger": "prefillDialog",
                    "script": "args.prefillModifiers.modifier -= 10 * this.effect.conditionValue",
                    "value": 1
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/conditions/prone.png",
            id: "prone",
            statuses: ["prone"],
            name: "WFRP4E.ConditionName.Prone",
            flags: {
                wfrp4e: {
                    "effectTrigger": "dialogChoice",
                    "effectData" : {
                        "description" : game.i18n.localize("EFFECT.TestsRelatedToMovementOfAnyKind"),
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
            statuses: ["fear"],
            name: "WFRP4E.ConditionName.Fear",
            flags: {
                wfrp4e: {
                    "effectTrigger": "dialogChoice",
                    "effectData" : {
                        "description" : game.i18n.localize("EFFECT.TestsToAffect"),
                        "slBonus" : "-1"
                    },
                    "script" : `
                        if (this.flags.wfrp4e.fearName)
                            this.flags.wfrp4e.effectData.description += " " + this.flags.wfrp4e.fearName
                        else
                            this.flags.wfrp4e.effectData.description += " " + game.i18n.localize("EFFECT.TheSourceOfFear")
                    `,
                    "value": null
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/conditions/surprised.png",
            id: "surprised",
            statuses: ["surprised"],
            name: "WFRP4E.ConditionName.Surprised",
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
            statuses: ["unconscious"],
            name: "WFRP4E.ConditionName.Unconscious",
            flags: {
                wfrp4e: {
                    "value": null
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/conditions/grappling.png",
            id: "grappling",
            statuses: ["grappling"],
            name: "WFRP4E.ConditionName.Grappling",
            flags: {
                wfrp4e: {
                    "value": null
                }
            }
            
        },
        {
            icon: "systems/wfrp4e/icons/conditions/engaged.png",
            id: "engaged",
            statuses: ["engaged"],
            name: "WFRP4E.ConditionName.Engaged",
            flags: {
                wfrp4e: {
                    "value": null
                }
            }
        },
        {
            icon: "systems/wfrp4e/icons/defeated.png",
            id: "dead",
            statuses: ["dead"],
            name: "WFRP4E.ConditionName.Dead",
            flags: {
                wfrp4e: {
                    "value": null
                }
            }
            
        }
    ]
}

WFRP4E.conditionScripts = {
    "ablaze" : async function (actor) {
        let effect = actor.hasCondition("ablaze")
        let value = effect.conditionValue;
 
        let leastProtectedLoc;
        let leastProtectedValue = 999;
        for (let loc in actor.status.armour)
        {
            if (actor.status.armour[loc].value != undefined && actor.status.armour[loc].value < leastProtectedValue)
            {
                leastProtectedLoc = loc;
                leastProtectedValue = actor.status.armour[loc].value;
            }
        }
        let formula = `1d10 + ${value - 1}`
        let msg = `<h2>${game.i18n.localize("WFRP4E.ConditionName.Ablaze")}</h2><b>${game.i18n.localize("Formula")}</b>: @FORMULA<br><b>${game.i18n.localize("Roll")}</b>: @ROLLTERMS` 
        
        let args = {msg, formula}
        await actor.runEffects("preApplyCondition", {effect, data : args});
        formula = args.formula;
        msg = args.msg;
        let roll = await new Roll(`${formula}`).roll({async: true});
        let terms = roll.terms.map(i => i.total).join(" ");
        msg = msg.replace("@FORMULA", formula);
        msg = msg.replace("@ROLLTERMS", terms);

        value = effect.conditionValue;
        let damageMsg = (`<br>` + await actor.applyBasicDamage(roll.total, {loc: leastProtectedLoc, suppressMsg : true})).split("")
        msg += damageMsg.join("");
        let messageData = game.wfrp4e.utility.chatDataSetup(msg);
        messageData.speaker = {alias: actor.prototypeToken.name}
        await actor.runEffects("applyCondition", {effect, data : {messageData}})
        return messageData
    },
    "poisoned" : async function (actor) {
        let effect = actor.hasCondition("poisoned")
        let msg = `<h2>${game.i18n.localize("WFRP4E.ConditionName.Poisoned")}</h2>`

        let damage = effect.conditionValue;
        let args = {msg, damage};
        await actor.runEffects("preApplyCondition", {effect, data : args})
        msg = args.msg;
        damage = args.damage;
        msg += await actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true})
        let messageData = game.wfrp4e.utility.chatDataSetup(msg);
        messageData.speaker = {alias: actor.prototypeToken.name}
        await actor.runEffects("applyCondition", {effect, data : {messageData}})
        return messageData
    },
    "bleeding" : async function(actor) {
        let effect = actor.hasCondition("bleeding")
        let bleedingAmt;
        let bleedingRoll;
        let msg = `<h2>${game.i18n.localize("WFRP4E.ConditionName.Bleeding")}</h2>`

        let damage = effect.conditionValue;
        let args = {msg, damage};
        await actor.runEffects("preApplyCondition", {effect, data : args})
        msg = args.msg;
        damage = args.damage;
        msg += await actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, minimumOne : false, suppressMsg : true})

        if (actor.status.wounds.value == 0 && !actor.hasCondition("unconscious"))
        {
            await actor.addCondition("unconscious")
            msg += `<br>${game.i18n.format("BleedUnc", {name: actor.prototypeToken.name })}`
        }

        if (actor.hasCondition("unconscious"))
        {
            bleedingAmt = value;
            bleedingRoll = (await new Roll("1d100").roll()).total;
            if (bleedingRoll <= bleedingAmt * 10) {
                msg += `<br>${game.i18n.format("BleedFail", {name: actor.prototypeToken.name} )} (${game.i18n.localize("Rolled")} ${bleedingRoll})`
                await actor.addCondition("dead")
            }
            else if (bleedingRoll % 11 == 0) {
                msg += `<br>${game.i18n.format("BleedCrit", { name: actor.prototypeToken.name } )} (${game.i18n.localize("Rolled")} ${bleedingRoll})`
                await actor.removeCondition("bleeding")
            }
            else {
                msg += `<br>${game.i18n.localize("BleedRoll")}: ${bleedingRoll}`
            }
        }

        let messageData = game.wfrp4e.utility.chatDataSetup(msg);
        messageData.speaker = {alias: actor.prototypeToken.name}
        await actor.runEffects("applyCondition", {effect, data : {messageData, bleedingRoll}})
        return messageData
    }
}

WFRP4E.effectTextStyle = CONFIG.canvasTextStyle.clone();
WFRP4E.effectTextStyle.fontSize = "30";
WFRP4E.effectTextStyle.fontFamily="CaslonAntique"


WFRP4E.effectApplication = {
    "actor" : "WFRP4E.effectApplication.actor",
    "equipped" : "WFRP4E.effectApplication.equipped",
    "apply" : "WFRP4E.effectApplication.apply",
    "damage" : "WFRP4E.effectApplication.damage",
    "item" : "WFRP4E.effectApplication.item",
}

WFRP4E.applyScope = {
    "actor" : "WFRP4E.applyScope.actor",
    "item" : "WFRP4E.applyScope.item"
}

WFRP4E.effectTriggers = {
    "invoke" : "Manually Invoked",
    "oneTime" : "Immediate",
    "addItems" : "Add Items",
    "dialogChoice" : "Dialog Choice",
    "prefillDialog" : "Prefill Dialog",
    "update" : "On Update",
    "prePrepareData" : "Pre-Prepare Data",
    "prePrepareItems" : "Pre-Prepare Actor Items",
    "prepareData" : "Prepare Data",
    "preWoundCalc" : "Pre-Wound Calculation",
    "woundCalc" : "Wound Calculation",
    "calculateSize" : "Size Calculation",
    "preAPCalc" : "Pre-Armour Calculation",
    "APCalc" : "Armour Calculation",
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
    "startTurn" : "Start Turn",
    "endRound" : "End Round",
    "endCombat" : "End Combat"
}

WFRP4E.syncEffectTriggers = [
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

WFRP4E.effectPlaceholder = {

    "invoke" : 
    `This effect is only applied when the Invoke button is pressed. Can be async.
    args:

    none`,
    "oneTime" : 
    `This effect happens once, immediately when applied. Can be async.
    args:

    actor : actor who owns the effect
    `,

    "addItems" : 
    `Like Immediate effects, this happens once, but the effect will remain. This lets the effect also delete the added items when the effect is deleted. Can be async.
    args: 

    actor : actor who owns the effect
    `,

    "prefillDialog" : 
    `This effect is applied before rendering the roll dialog, and is meant to change the values prefilled in the bonus section. Can be async.
    args:

    prefillModifiers : {modifier, difficulty, slBonus, successBonus}
    type: string, 'weapon', 'skill' 'characteristic', etc.
    item: the item used of the aforementioned type
    options: other details about the test (options.rest or options.mutate for example)
    
    Example: 
    if (args.type == "skill" && args.item.name == "Athletics") args.prefillModifiers.modifier += 10`,

    "update" : 
    `This effect runs when an actor or an embedded document is changed. Can be async.
    args:

    item: if an item is modified, it is provided as an argument
    effect: if an effect is modified, it is provided as an argument
    `,

    "prePrepareData" : 
    `This effect is applied before any actor data is calculated. Cannot be async.
    args:

    actor : actor who owns the effect
    `,

    "prePrepareItems" : 
    `This effect is applied before items are sorted and calculated. Cannot be async.

    actor : actor who owns the effect
    `,

    "prepareData" : 
    `This effect is applied after actor data is calculated and processed. Cannot be async.

    args:

    actor : actor who owns the effect
    `,

    "preWoundCalc" : 
    `This effect is applied right before wound calculation, ideal for swapping out characteristics or adding multipiliers. Cannot be async.

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
    `This effect happens after wound calculation, ideal for multiplying the result. Cannot be async.

    args:

    actor : actor who owns the effect
    wounds : wounds calculated

    e.g. for Swarm: "wounds *= 5"
    `,

    "calculateSize" : 
    `This effect is applied after size calculation, where it can be overridden. Cannot be async.

    args:

    size : Size value

    e.g. for Small: "args.size = 'sml'"
    `,

    "preAPCalc" : `This effect is applied before AP is calculated. Cannot be async.

    args:

    AP : Armour object

    e.g. args.AP.head.value += 1
    `,
    "APCalc" : `This effect is applied after AP is calculated. Cannot be async.

    args:

    AP : Armour object

    e.g. args.AP.head.value += 1
    `,

    "preApplyDamage" : 
    `This effect happens before applying damage in an opposed test. Can be async.

    args:

    actor : actor who is taking damage
    attacker : actor who is attacking
    opposedTest : object containing opposed test data
    damageType : damage type selected (ignore TB, AP, etc.)
    weaponProperties : object of qualities/flaws of the attacking weapon
    applyAP : whether AP is reducing damage
    applyTB : whether TB is reducing damage
    totalWoundLoss : Total Wound Loss BEFORE REDUCTIONS
    AP : Defender's AP object
    `,
    "applyDamage" : 
    `This effect happens after damage in an opposed test is calculated, but before actor data is updated. Can be async.

    args:

    actor : actor who is taking damage
    attacker : actor who is attacking
    opposedTest : object containing opposed test data
    damageType : damage type selected (ignore TB, AP, etc.)
    totalWoundLoss : Wound loss after mitigations
    AP : data about the AP used
    updateMsg : starting string for damage update message
    messageElements : array of strings used to show how damage mitigation was calculated,
    extraMessages : text applied at the end of updateMsg
    `,

    "preTakeDamage" : 
    `This effect happens before taking damage in an opposed test. Can be async.

    args:
    actor : actor who is taking damage
    attacker : actor who is attacking
    opposedTest : object containing opposed test data
    damageType : damage type selected (ignore TB, AP, etc.)
    weaponProperties : object of qualities/flaws of the attacking weapon
    applyAP : whether AP is reducing damage
    applyTB : whether TB is reducing damage
    totalWoundLoss : Total Wound Loss BEFORE REDUCTIONS
    AP : Defender's AP object
    `,
    
    "takeDamage" : 
    `This effect happens after damage in an opposed test is calculated, but before actor data is updated. Can be async.

    args:

    actor : actor who is taking damage
    attacker : actor who is attacking
    opposedTest : object containing opposed test data
    damageType : damage type selected (ignore TB, AP, etc.)
    totalWoundLoss : Wound loss after mitigations
    AP : data about the AP used
    updateMsg : starting string for damage update message
    messageElements : array of strings used to show how damage mitigation was calculated,
    extraMessages : text applied at the end of updateMsg
    `,

    "preApplyCondition" :  
    `This effect happens before effects of a condition are applied. Can be async.

    args:

    effect : condition being applied
    data : {
        msg : Chat message about the application of the condition
        <other data, possibly condition specific>
    }
    `,

    "applyCondition" :  
    `This effect happens after effects of a condition are applied. Can be async.

    args:

    effect : condition being applied
    data : {
        messageData : Chat message about the application of the condition
        <other data, possibly condition specific>
    }
    `,
    "prePrepareItem" : 
    `This effect is applied before an item is processed with actor data. Cannot be async.

    args:

    item : item being processed
    `,
    "prepareItem" : 
    `This effect is applied after an item is processed with actor data. Cannot be async.

    args:

    item : item processed
    `,
    "preRollTest": 
    `This effect is applied before a test is calculated. Can be async.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,
    "preRollWeaponTest" :  
    `This effect is applied before a weapon test is calculated. Can be async.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "preRollCastTest" :  
    `This effect is applied before a casting test is calculated. Can be async.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "preChannellingTest" :  
    `This effect is applied before a channelling test is calculated. Can be async.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "preRollPrayerTest" :  
    `This effect is applied before a prayer test is calculated. Can be async.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "preRollTraitTest" :  
    `This effect is applied before a trait test is calculated. Can be async.

    args:

    testData: All the data needed to evaluate test results
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollTest" : 
    `This effect is applied after a test is calculated. Can be async.

    args:

    test: object containing test and result information
    cardOptions: Data for the card display, title, template, etc
    `,
    "rollIncomeTest" : 
    `This effect is applied after an income test is calculated. Can be async.

    args:

    test: object containing test and result information
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollWeaponTest" : 
    `This effect is applied after a weapon test is calculated. Can be async.

    args:

    test: object containing test and result information
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollCastTest" : 
    `This effect is applied after a casting test is calculated. Can be async.

    args:

    test: object containing test and result information
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollChannellingTest" : 
    `This effect is applied after a channelling test is calculated. Can be async.

    args:

    test: object containing test and result information
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollPrayerTest" : 
    `This effect is applied after a prayer test is calculated. Can be async.

    args:

    test: object containing test and result information
    cardOptions: Data for the card display, title, template, etc
    `,

    "rollTraitTest" : 
    `This effect is applied after a trait test is calculated. Can be async.

    args:

    test: object containing test and result information
    cardOptions: Data for the card display, title, template, etc
    `,

    "preOpposedAttacker" : 
    `This effect is applied before an opposed test result begins calculation, as the attacker. Can be async.

    args:

    attackerTest: test object of the attacker
    defenderTest: test object of the defender
    opposedTest: opposedTest object, before calculation
    `,
    "preOpposedDefender" : 
    `This effect is applied before an opposed test result begins calculation, as the defender. Can be async.

    args:

    attackerTest: test object of the attacker
    defenderTest: test object of the defender
    opposedTest: opposedTest object, before calculation
    `,

    "opposedAttacker" : 
    `This effect is applied after an opposed test result begins calculation, as the attacker. Can be async.

    args:

    attackerTest: test object of the attacker
    defenderTest: test object of the defender
    opposedTest: opposedTest object, after calculation
    `,

    "opposedDefender" : 
    `This effect is applied after an opposed test result begins calculation, as the defender. Can be async.

    args:

    attackerTest: test object of the attacker
    defenderTest: test object of the defender
    opposedTest: opposedTest object, after calculation
    `,

    "calculateOpposedDamage" : 
    `This effect is applied during an opposed test damage calculation. This effect runs on the attacking actor. Can be async.

    args:

    damage : initial damage calculation before multipliers
    damageMultiplier : multiplier calculated based on size difference
    sizeDiff : numeric difference in sized, will then be used to add damaging/impact
    opposedTest : opposedTest object,
    addDamaging : whether to add the Damaging quality 
    addImpact : whether to add the Impact quality
    `,

    "getInitiativeFormula" : 
    `This effect runs when determining actor's initiative. Cannot be async.

    args:

    initiative: Calculated initiative value
    `,

    "targetPrefillDialog" : 
    `This effect is applied to another actor whenever they target this actor, and is meant to change the values prefilled in the bonus section. Can be async.
    args:

    prefillModifiers : {modifier, difficulty, slBonus, successBonus}
    type: string, 'weapon', 'skill' 'characteristic', etc.
    item: the item used of the aforementioned type
    options: other details about the test (options.rest or options.mutate for example)
    
    Example: 
    if (args.type == "skill" && args.item.name == "Athletics") args.prefillModifiers.modifier += 10`,

    "endTurn" : 
    `This effect runs at the end of an actor's turn. Can be async.

    args:

    combat: current combat
    `,

    "startTurn" : 
    `This effect runs at the start of an actor's turn. Can be async.

    args:

    combat: current combat
    `,

    "endRound" :  
    `This effect runs at the end of a round. Can be async.

    args:

    combat: current combat
    `,
    "endCombat" :  
    `This effect runs when combat has ended. Can be async.

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

export default WFRP4E
