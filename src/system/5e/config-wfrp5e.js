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


   
export default WFRP5E
