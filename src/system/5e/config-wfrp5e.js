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

WFRP5E.overcastTable = {
        range: [
            {cost: 1, value: 2},
            {cost: 5, value: 3},
            {cost: 18, value: 4}],
        targets: [
            {cost: 1, value: 1},
            {cost: 5, value: 2},
            {cost: 18, value: 3}],
        aoe: [
            {cost: 3, value: 2},
            {cost: 18, value: 3}],
        duration: [
            {cost: 2, value: 2},
            {cost: 8, value: 3}],
        damage: [
            {cost: 1, value: 1},
            {cost: 2, value: 2},
            {cost: 3, value: 3},
            {cost: 5, value: 4},
            {cost: 8, value: 5},
            {cost: 13, value: 6},
            {cost: 18, value: 7}]
}

WFRP5E.statusEffects = [
    {
        img: "systems/wfrp4e/icons/conditions/bleeding.png",
        id: "bleeding",
        statuses: ["bleeding"],
        name: "WFRP4E.ConditionName.Bleeding",
        description : "WFRP4E.Conditions.Bleeding",
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
                    script: `let uiaBleeding = game.settings.get("wfrp4e", "uiaBleeding");
                        let actor = this.actor;
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
                            addBleedingUnconscious = async () => {
                                await actor.addCondition("unconscious")
                                msg += "<br>" + game.i18n.format("BleedUnc", {name: actor.prototypeToken.name })
                            }
                            if (uiaBleeding) {
                                test = await actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle : " - " + this.effect.name, skipTargets: true, fields : {difficulty : "challenging"}});
                                await test.roll();
                                if (test.failed) {
                                    await addBleedingUnconscious();
                                }
                            } else {
                                await addBleedingUnconscious();
                            }
                        }

                        if (actor.hasCondition("unconscious"))
                        {
                            bleedingAmt = effect.conditionValue;
                            bleedingRoll = (await new Roll("1d10").roll()).total;
                            if (bleedingRoll == 10)
                            {
                                msg += "<br>" + game.i18n.format("BleedCrit", { name: actor.prototypeToken.name } ) + " (" + game.i18n.localize("Rolled") + bleedingRoll + ")"
                                await actor.removeCondition("bleeding")
                            }
                            else if (bleedingRoll <= bleedingAmt)
                            {
                                msg += "<br>" + game.i18n.format("BleedFail", {name: actor.prototypeToken.name}) + " (" + game.i18n.localize("Rolled") + " " + bleedingRoll + ")";
                                await actor.addCondition("dead")
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
        description : "WFRP4E.Conditions.Poisoned",
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
                    script: `args.fields.SL -= 1 * this.effect.conditionValue`,
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
        description : "WFRP4E.Conditions.Ablaze",
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
                        let msg = "<strong>Formula</strong>: @FORMULA"

                        let scriptArgs = {msg, formula}
                        await Promise.all(this.actor.runScripts("preApplyCondition", {effect : this.effect, data : scriptArgs}));
                        formula = scriptArgs.formula;
                        msg = scriptArgs.msg;
                        let roll = await new Roll(formula, this).roll({allowInteractive : false});
                        let terms = roll.terms.map(i => (i instanceof foundry.dice.terms.Die ? (i.formula + " (" + i.total + ")") : (i.total))).join("")
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
        img: "systems/wfrp4e/icons/conditions/besmirched.png",
        id: "besmirched",
        statuses: ["besmirched"],
        name: "WFRP4E.ConditionName.Besmirched",
        description : "WFRP4E.Conditions.besmirched",
        system: {
            condition : {
                value : null,
                numbered: false
            },
            scriptData: [
                {
                    trigger: "dialog",
                    label: "Disadvantage on Fellowship Tests",
                    script: `args.fields.disadvantage++;`,
                    options: {
                        hideScript: `args.fields.characteristic != "fel"`,
                        activateScript: `args.fields.characteristic == "fel"`,
                    }
                }
            ]
        }
    },
    {
        img: "systems/wfrp4e/icons/conditions/deafened.png",
        id: "deafened",
        statuses: ["deafened"],
        name: "WFRP4E.ConditionName.Deafened",
        description : "WFRP4E.Conditions.Deafened",
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
        description : "WFRP4E.Conditions.Stunned",
        system: {
            condition : {
                value : 1,
                numbered: true
            },
            scriptData: [
                {
                    trigger: "dialog",
                    label: "Penalty to all Tests (@effect.name)",
                    script: `args.fields.SL -= 1 * this.effect.conditionValue`,
                    options: {
                        activateScript: "return true"
                    }
                },
                {
                    trigger: "prePrepareData",
                    label: "Half Movement",
                    script: `args.actor.system.details.move.value /= 2`
                },
                {
                    trigger: "updateDocument",
                    label: "Add Unconscious",
                    script: `if (this.actor.hasCondition("stunned")?.conditionValue > this.actor.system.characteristics.t.bonus) this.actor.addCondition("unconscious");`
                },
                {
                    trigger: "endRound",
                    label: "Roll to remove Stunned",
                    script: `
const test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields: {difficulty: "challenging"}, skipTargets: true, appendTitle :  \` - \${this.effect.name}\`, context: {success: "Removed SL + 1 Conditions.", failure: "Failed to remove Conditions."}});
await test.roll();
if (test.succeeded) {
const toRemove = 1 + Number(test.result.SL);
this.actor.removeCondition("stunned", toRemove);
}
                `,
                },
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
        description : "WFRP4E.Conditions.Entangled",
        system: {
            condition : {
                value : 1,
                numbered: true
            },
            scriptData: [
                {
                    trigger: "dialog",
                    label: "Tests related to movement of any kind",
                    script: `args.fields.SL -= 1 * this.effect.conditionValue`,
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
        description : "WFRP4E.Conditions.Fatigued",
        system: {
            condition : {
                value : 1,
                numbered: true
            },
            scriptData: [
                {
                    trigger: "dialog",
                    label: "Penalty to all Tests (@effect.name)",
                    script: `args.fields.SL -= 1 * this.effect.conditionValue`,
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
        description : "WFRP4E.Conditions.Blinded",
        system: {
            condition : {
                value : 1,
                numbered: true
            },
            scriptData: [
                {
                    trigger: "dialog",
                    label: "Melee Tests or any related to sight",
                    script: `args.fields.disadvantage++`,
                    options: {
                            activateScript: "return ['ws', 'bs', 'ag'].includes(args.characteristic)"
                    }
                },
                {
                    trigger: "dialog",
                    label: "Cannot perform Ranged Tests",
                    script: `args.fields.disadvantage++`,
                    options: {
                            hideScript: "if (['bs'].includes(args.characteristic)) {args.abort = true; this.script.notification('Cannot perform Ranged attacks!');} return true;"
                    }
                },
                {
                    trigger: "dialog",
                    label: "Advanatge against Blinded",
                    script: `args.fields.advantage++`,
                    options: {
                            targeter: true,
                            hideScript: "return args.item?.attackType != 'melee' || args.actor.hasCondition('blinded')",
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
        description : "WFRP4E.Conditions.Broken",
        system: {
            condition : {
                value : 1,
                numbered: true
            },
            scriptData: [
                {
                    trigger: "dialog",
                    label: "Penalty to all Tests not involving running and hiding.",
                    script: `args.fields.SL -= 1 * this.effect.conditionValue`,
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
        description : "WFRP4E.Conditions.Prone",
        system: {
            condition : {
                value : null,
                numbered: false
            },
            scriptData: [
                {
                    trigger: "dialog",
                    label: "Disadvantage on movement of any kind",
                    script: `args.fields.disadvantage++;`,
                    options: {
                            activateScript: "return ['ws', 'bs', 'ag'].includes(args.characteristic)"
                    }
                },
                {
                    trigger: "dialog",
                    label: "Advantage to attack Prone",
                    script: `args.fields.advantage++;`,
                    options: {
                        targeter: true,
                        hideScript: "return !args.item?.system.isMelee",
                        activateScript: "return args.item?.system.isMelee"
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
        description : "WFRP4E.Conditions.Surprised",
        system: {
            condition : {
                value : null,
                numbered: false
            },
            scriptData: [
                {
                    trigger: "dialog",
                    label: "Bonus to attack Surprised",
                    script: `args.fields.SL += 2`,
                    options: {
                        targeter: true,
                        hideScript: "return !args.item?.system.isMelee",
                        activateScript: "return args.item?.system.isMelee"
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
        description : "WFRP4E.Conditions.Unconscious",
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
        description : "WFRP4E.Conditions.Grappling",
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
        description : "WFRP4E.Conditions.Engaged",
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
        description : "WFRP4E.Conditions.Dead",
        system : {
            condition : {
                value : null,
                numbered: false
            },
        },
        flags: {
            core: {
                overlay: true
            }
        }
    }
]


// WFRP5E.propertyEffects = {
    
//         // TODO remove accurate

//         parry: { // TODO
//             name : game.i18n.localize("PROPERTY.Parry"), 
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item"
//                 },
//                 scriptData : [{
//                     label : "Accurate",
//                     trigger : "dialog",
//                     script : "",
//                     options : {
//                         hideScript : "",
//                         activateScript : "return true"
//                     }
//                 }
//             ],
//             }
//         },
//         blackpowder: {
//             img : "systems/wfrp4e/icons/blank.png",
//             name: game.i18n.localize("EFFECT.BlackpowderShock"),
//             system: {
//                 transferData : {
//                     type : "target",
//                     documentType : "Actor"
//                 },
//                 scriptData: [
//                     {
//                         label: "@effect.name",
//                         trigger: "immediate",
//                         script: `
//                             test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle : " - " + this.effect.name, skipTargets: true, fields : {difficulty : "average"}});
//                             await test.roll();
//                             if (test.failed)
//                             {
//                                 this.actor.addCondition("broken");
//                             }
//                             return false;
//                         `
//                     }
//                 ]
//             }
//         },
//         engineering: {
//             img : "systems/wfrp4e/icons/blank.png",
//             name: game.i18n.localize("EFFECT.BlackpowderShock"),
//             system: {
//                 transferData : {
//                     type : "target",
//                     documentType : "Actor"
//                 },
//                 scriptData: [
//                     {
//                         label: "@effect.name",
//                         trigger: "immediate",
//                         script: `
//                             test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle : " - " + this.effect.name, skipTargets: true, fields : {difficulty : "average"}});
//                             await test.roll();
//                             if (test.failed)
//                             {
//                                 this.actor.addCondition("broken");
//                             }
//                             return false;
//                         `
//                     }
//                 ]
//             }
//         },
//         blast: { // TODO, no SL damage
//             name : game.i18n.localize("PROPERTY.Blast"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item"
//                 },
//                 scriptData : [{
//                     label : "Blast",
//                     trigger : "rollWeaponTest",
//                     script : "if (args.test.succeeded) args.test.result.other.push(`<a class='content-link' data-action='placeTemplate' data-type='diameter'><i class='fas fa-ruler-combined'></i>${this.item.properties.qualities.blast.value} yard Blast</a>`)",
//                 }]
//             }
//         },
//         damaging: { // TODO
//             name : game.i18n.localize("PROPERTY.Damaging"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         defensive: {
//             name : game.i18n.localize("PROPERTY.Defensive"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Actor",
//                     equipTransfer: true
//                 },
//                 scriptData : [{
//                     label : "Defensive",
//                     trigger : "dialog",
//                     script : "if (!args.flags.defensive) { args.fields.SL++; args.flags.defensive = true; }",
//                     options : {
//                         activateScript : "return args.actor.attacker",
//                         hideScript : "return !args.actor.attacker"
//                     }
//                 }]
//             }
//         },
//         distract: {
//             name : game.i18n.localize("PROPERTY.Distract"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         entangle: {
//             name : game.i18n.localize("PROPERTY.Entangle"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//                 scriptData : [{
//                     label : "Entangle",
//                     trigger : "applyDamage",
//                     script : "args.actor.addCondition('entangled')"
//                 }]
//             }

//         },
//         fast: {
//             name : game.i18n.localize("PROPERTY.Fast"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         hack: {
//             name : game.i18n.localize("PROPERTY.Hack"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         impact: {
//             name : game.i18n.localize("PROPERTY.Impact"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         impale: {
//             name : game.i18n.localize("PROPERTY.Impale"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         magical: {
//             name : game.i18n.localize("PROPERTY.Magical"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         penetrating: {
//             name : game.i18n.localize("PROPERTY.Penetrating"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         pistol: {
//             name : game.i18n.localize("PROPERTY.Pistol"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         precise: {
//             name : game.i18n.localize("PROPERTY.Precise"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item"
//                 },
//                 scriptData : [{
//                     label : "Precise",
//                     trigger : "dialog",
//                     script : "args.fields.successBonus += 1;",
//                     options : {
//                         hideScript : "",
//                         activateScript : "return true"
//                     }
//                 }]
//             }
//         },
//         pummel: {
//             name : game.i18n.localize("PROPERTY.Pummel"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         repeater: {
//             name : game.i18n.localize("PROPERTY.Repeater"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         shield: {
//             name : game.i18n.localize("PROPERTY.Shield"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         trapblade: {
//             name : game.i18n.localize("PROPERTY.TrapBlade"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         unbreakable: {
//             name : game.i18n.localize("PROPERTY.Unbreakable"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         wrap: {
//             name : game.i18n.localize("PROPERTY.Wrap"),
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },




//         // Flaws
//         dangerous: {
//             name : game.i18n.localize("PROPERTY.Dangerous"), 
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         imprecise: {
//             name : game.i18n.localize("PROPERTY.Imprecise"), 
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item"
//                 },
//                 scriptData : [{
//                     label : "Imprecise",
//                     trigger : "dialog",
//                     script : "args.fields.slBonus -= 1;",
//                     options : {
//                         hideScript : "",
//                         activateScript : "return true"
//                     }
//                 }]
//             }
//         },
//         reload: {
//             name : game.i18n.localize("PROPERTY.Reload"), 
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         slow: {
//             name : game.i18n.localize("PROPERTY.Slow"), 
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         tiring: {
//             name : game.i18n.localize("PROPERTY.Tiring"), 
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },
//         undamaging: {
//             name : game.i18n.localize("PROPERTY.Undamaging"), 
//             img : "systems/wfrp4e/icons/blank.png",
//             system : {
//                 transferData : {
//                     documentType : "Item",
//                 },
//             }
//         },

// }
   
export default WFRP5E
