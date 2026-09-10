const WFRP5E = {}

WFRP5E.xpCost = {
    "characteristic": [25, 35, 50, 70, 100, 140, 190, 260, 360, 510, 720, 1005, 1390, 1800, 2250],
    "skill": [10, 15, 20, 30, 50, 80, 120, 170, 170, 340, 500, 700, 950, 1300, 1700]
}

// Difficulty Modifiers
WFRP5E.difficultyModifiers = {
    "veasy": 6,
    "easy": 4,
    "average": 2,
    "challenging": 0,
    "difficult": -1,
    "hard": -2,
    "vhard": -3
}

WFRP5E.difficultyLabels = {

    "veasy": "5e.DIFFICULTY.VEasy",
    "easy": "5e.DIFFICULTY.Easy",
    "average": "5e.DIFFICULTY.Average",
    "challenging": "5e.DIFFICULTY.Challenging",
    "difficult": "5e.DIFFICULTY.Difficult",
    "hard": "5e.DIFFICULTY.Hard",
    "vhard": "5e.DIFFICULTY.VHard"
}

WFRP5E.systemEffects = {
    momentum: {
        name: "NAME.Momentum",
        img: "systems/wfrp4e/icons/conditions/momentum.png",
        statuses: ["momentum"],
        system: {
            transferData: {},
            scriptData: [
                {
                    label: "Advantage on Melee Tests",
                    trigger: "dialog",
                    script: `args.fields.advantage++`,
                    options: {
                            hideScript: `return args.fields.characteristic != "ws"`,
                            activateScript: `return args.fields.characteristic == "ws"`
                    }
                },
                {
                    label: "Remove",
                    trigger: "endCombat",
                    script: `this.actor.update({"system.status.momentum" : false})`,
                },
                {
                    label: "Take Damage",
                    trigger: "takeDamage",
                    script: `if (args.totalWoundLoss) this.actor.update({"system.status.momentum" : false})`
                },
                {
                    label: "Gain Condition",
                    trigger: "updateDocument",
                    script: `if (args.type == "effect" && args.options.action == "create" && args.document.isCondition)
                        {
                            this.actor.update({"system.status.momentum" : false})
                        }
                        `
                }
            ]
        }
    },
    channelling: {
        name: "NAME.Channelling",
        img: "modules/wfrp4e-core/art/magic/winds.webp",
        statuses: ["channelling"],
        system: {
            transferData: {},
            scriptData: [
                {
                    label: "Channelled SL",
                    trigger: "dialog",
                    script: `args.fields.SL += args.actor.system.status.channelling.value`,
                    options: {
                            hideScript: `return !args.spell || !args.spell.system.usesWind(this.effect.getFlag("wfrp4e", "wind"))`,
                            activateScript: `return true;`,
                            submissionScript: `args.actor.update(args.actor.system.status.channelling.clear())`
                    }
                }
            ]
        }
    }
}

// Range Test Modifiers
WFRP5E.rangeModifiers = {
    "Point Blank": 2,
    "Short Range": 1,
    "Normal": 0,
    "Long Range": -1,
    "Extreme": -2,
}


WFRP5E.loreWind = {
    "petty": "petty",
    "beasts": "ghur",
    "death": "shyish",
    "fire": "aqshy",
    "heavens": "azyr",
    "metal": "chamon",
    "life": "ghyran",
    "light": "hysh",
    "shadow": "ulgu",
    "hedgecraft": "magick",
    "witchcraft": "magick",
    "daemonology": "dhar",
    "necromancy": "dhar",
    "undivided" : "dhar",
    "nurgle": "dhar",
    "slaanesh": "dhar",
    "tzeentch": "dhar",
};

WFRP5E.magicWind = {
    "aqshy" : "5e.MagicWind.Aqshy",
    "azyr" : "5e.MagicWind.Azyr",
    "chamon" : "5e.MagicWind.Chamon",
    "dhar" : "5e.MagicWind.Dhar",
    "ghur" : "5e.MagicWind.Ghur",
    "ghyran" : "5e.MagicWind.Ghyran",
    "hysh" : "5e.MagicWind.Hysh",
    "magick" : "5e.MagicWind.Magick",
    "qhaysh" : "5e.MagicWind.Qhaysh",
    "shyish" : "5e.MagicWind.Shyish",
    "skaven" : "5e.MagicWind.Skaven",
    "ulgu" : "5e.MagicWind.Ulgu",
    "waaagh!" : "5e.MagicWind.Waaagh!"
};

WFRP5E.windIcons = {
    "aqshy" : "modules/wfrp4e-core/art/magic/aqshy.webp",
    "azyr" : "modules/wfrp4e-core/art/magic/azyr.webp",
    "chamon" : "modules/wfrp4e-core/art/magic/chamon.webp",
    "dhar" : "modules/wfrp4e-core/art/magic/winds.webp",
    "ghur" : "modules/wfrp4e-core/art/magic/ghur.webp",
    "ghyran" : "modules/wfrp4e-core/art/magic/ghyran.webp",
    "hysh" : "modules/wfrp4e-core/art/magic/hysh.webp",
    "magick" : "modules/wfrp4e-core/art/magic/winds.webp",
    "qhaysh" : "modules/wfrp4e-core/art/magic/winds.webp",
    "shyish" : "modules/wfrp4e-core/art/magic/shyish.webp",
    "skaven" : "modules/wfrp4e-core/art/magic/winds.webp",
    "ulgu" : "modules/wfrp4e-core/art/magic/ulgu.webp",
    "waaagh!" : "modules/wfrp4e-core/art/magic/winds.webp"
};

   
export default WFRP5E
