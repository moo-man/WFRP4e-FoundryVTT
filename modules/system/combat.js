import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

export default class CombatHelpers {


    static scripts = {
        startCombat: [CombatHelpers.checkFearTerror],
        endCombat: [CombatHelpers.clearCombatantAdvantage, CombatHelpers.endCombatChecks],
        startTurn: [CombatHelpers.startTurnChecks],
        endRound: [CombatHelpers.checkEndRoundConditions, CombatHelpers.fearReminders],
        endTurn: [CombatHelpers.checkEndTurnConditions],
        // Functions used by endCombatChecks
        endCombatScripts: [CombatHelpers.checkCorruption, CombatHelpers.checkInfection, CombatHelpers.checkDiseases]
    }

    static combatChecks(combat, type) {
        CombatHelpers.scripts[type].forEach(script => { script(combat) })
    }

    static preUpdateCombat(combat, updateData) {
        if (!updateData.round && !updateData.turn)
            return
        if (combat.round == 0  && combat.active) {
            CombatHelpers.combatChecks(combat, "startCombat")
        }
        if (combat.round != 0 && combat.turns && combat.active) {
            if (combat.current.turn > -1 && combat.current.turn == combat.turns.length - 1) {
                CombatHelpers.combatChecks(combat, "endRound")
            }
        }

        CombatHelpers.combatChecks(combat, "endTurn")
    }

    static updateCombat(combat, updateData) {
        if (!updateData.round && !updateData.turn)
            return
        if (combat.round != 0 && combat.turns && combat.active) {
            CombatHelpers.combatChecks(combat, "startTurn")
        }
    }

    static endCombat(combat) {
        CombatHelpers.combatChecks(combat, "endCombat")
    }


    static async startTurnChecks(combat) {
        if (!game.user.isUniqueGM)
            return

        let turn = combat.turns.find(t => t.token.id == combat.current.tokenId)
        if (turn) {

            if (turn.actor.hasSystemEffect("dualwielder"))
                await turn.actor.removeSystemEffect("dualwielder")

            if (game.settings.get("wfrp4e", "statusOnTurnStart")) {
                let nameOverride =  combat.combatant.hidden ? "???" : turn.name;
                turn.actor.displayStatus(combat.round, nameOverride);
            }

            if (game.settings.get("wfrp4e", "focusOnTurnStart")) {
                canvas.tokens.get(turn.token.id).control();
                canvas.tokens.cycleTokens(1, true);
            }

            await turn.actor.runEffects("startTurn", combat)


        }
        else {
            console.warn("wfrp4e | No actor token found: %o.", combat)
        }
        WFRP_Audio.PlayContextAudio({ item: { type: 'round' }, action: "change" })
    }

    static endCombatChecks(combat) {
        if (!game.user.isUniqueGM)
            return

        let content = ""

        for (let script of CombatHelpers.scripts.endCombatScripts) {
            let scriptResult = script(combat)
            if (scriptResult)
                content += scriptResult + "<br><br>";
        }

        if (content) {
            content = `<h2>${game.i18n.localize("CHAT.EndCombat")}</h3>` + content;
            ChatMessage.create({ content, whisper: ChatMessage.getWhisperRecipients("GM") })
        }
    }

    static checkFearTerror(combat) {
        if (!game.user.isUniqueGM)
            return

        let fearCounters = []
        let terrorCounters = [];
        for (let turn of combat.turns) {
            try {

            let fear = turn.actor.has(game.i18n.localize("CHAT.Fear"))
            if (fear)
                fearCounters.push({ name: turn.name, value: `@Fear[${fear.specification.value},${turn.name}]` })

            let terror = turn.actor.has(game.i18n.localize("CHAT.Terror"))
            if (terror)
                terrorCounters.push({ name: turn.name, value: `@Terror[${terror.specification.value},${turn.name}]` })

            }
            catch (e)
            {
                console.log(e)
            }
        }
        let msg = ""
        if (fearCounters.length || terrorCounters.length) {
            if (fearCounters.length)
                msg += `<h2>${game.i18n.localize("CHAT.Fear")}</h2>${fearCounters.map(f => `<b>${f.name}</b> - ${f.value}`).join("<br>")}`
            if (terrorCounters.length)
                msg += `<h2>${game.i18n.localize("CHAT.Terror")}</h2>${terrorCounters.map(t => `<b>${t.name}</b> - ${t.value}`).join("<br>")}`

        }

        msg += CombatHelpers.checkSizeFearTerror(combat)

        if (msg)
            ChatMessage.create({ content: msg })

    }

    static checkSizeFearTerror(combat) {
        let sizeMap = {}
        let msg = ""
        for (let turn of combat.turns) {
            sizeMap[turn.name] = turn.actor.sizeNum
        }
        for (let actor in sizeMap) {
            let size = sizeMap[actor]
            let smallerBy = {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: []
            }

            for (let otherActor in sizeMap) {
                if (otherActor == actor)
                    continue
                try {
                    if (size > sizeMap[otherActor])
                        smallerBy[size - sizeMap[otherActor]].push(otherActor)
                }
                catch (e) {

                }
            }

            if (smallerBy[1].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Fear[${1}, ${actor}]`, actor: actor, target: smallerBy[1].join(", ")});

            if (smallerBy[2].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${2}, ${actor}]`, actor: actor, target: smallerBy[2].join(", ")});

            if (smallerBy[3].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${3}, ${actor}]`, actor: actor, target: smallerBy[3].join(", ")});

            if (smallerBy[4].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${4}, ${actor}]`, actor: actor, target: smallerBy[4].join(", ")});

            if (smallerBy[5].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${5}, ${actor}]`, actor: actor, target: smallerBy[5].join(", ")});

            if (smallerBy[6].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${6}, ${actor}]`, actor: actor, target: smallerBy[6].join(", ")});

            if (Object.values(smallerBy).some(list => list.length))
            {
                msg += "<br>"
            }
        }
        if (msg) msg = `<br><h2>${game.i18n.localize("Size")}</h2>${msg}`
        return msg
    }


    static checkCorruption(combat) {
        if (!game.user.isUniqueGM)
            return

        let corruptionCounters = []

        for (let turn of combat.turns) {
            let corruption = turn.actor.has(game.i18n.localize("NAME.Corruption"))
            if (corruption) {
                let existing = corruptionCounters.find(c => c.type == corruption.specification.value)
                if (existing)
                    existing.counter++;
                else
                    corruptionCounters.push({ counter: 1, type: corruption.specification.value })
            }
        }

        let content = ""

        if (corruptionCounters.length) {
            content += `<h3><b>${game.i18n.localize("Corruption")}</b></h3>`
            for (let corruption of corruptionCounters) {
                content += `${corruption.counter} ${corruption.type}<br>`
            }
            content += game.i18n.localize("CHAT.CorruptionTest");
            content += `<br>@Corruption[Minor]<br>@Corruption[Moderate]<br>@Corruption[Major]`
        }
        return content
    }


    static checkInfection(combat) {
        if (!game.user.isUniqueGM)
            return

        let minorInfections = combat.getFlag("wfrp4e", "minorInfections") || []
        let content = ""
        if (minorInfections.length) {
            content += `<h3><b>${game.i18n.localize("Minor Infections")}</b></h3>${game.i18n.localize("CHAT.InfectionReminder")}<br>`
            for (let actor of minorInfections) {
                content += `<br><b>${actor}</b>`
            }
        }
        return content
    }
    static checkDiseases(combat) {
        if (!game.user.isUniqueGM)
            return

        let diseaseCounters = []

        for (let turn of combat.turns) {
            let disease = turn.actor.has(game.i18n.localize("NAME.Disease"))
            if (disease) {
                let existing = diseaseCounters.find(d => d.type == disease.specification.value)
                if (existing)
                    existing.counter++;
                else
                    diseaseCounters.push({ counter: 1, type: disease.specification.value })
            }
        }
        let content = ""

        if (diseaseCounters.length) {
            content += `<h3><b>${game.i18n.localize("Diseases")}</b></h3>`
            for (let disease of diseaseCounters)
                content += `${disease.counter} <a class="item-lookup" data-type="disease" data-open="sheet">${disease.type}</a><br>`

            content += game.i18n.localize("CHAT.DiseasesRules");
        }
        return content
    }

    static async checkEndRoundConditions(combat) {
        if (!game.user.isUniqueGM)
            return

        let removedConditions = []
        let msgContent = ""
        for (let turn of combat.turns) {
            let endRoundConditions = turn.actor.actorEffects.filter(e => e.conditionTrigger == "endRound")
            for (let cond of endRoundConditions) {
                if (game.wfrp4e.config.conditionScripts[cond.conditionId]) {
                    let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId])
                    if (Number.isNumeric(cond.flags.wfrp4e.value))
                        conditionName += ` ${cond.flags.wfrp4e.value}`
                    msgContent = `
              <h2>${conditionName}</h2>
              <a class="condition-script" data-combatant-id="${turn.id}" data-cond-id="${cond.conditionId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>
              `
                    ChatMessage.create({ content: msgContent, speaker: { alias: turn.token.name } })

                }
            }

            let conditions = turn.actor.actorEffects.filter(e => e.isCondition)
            for (let cond of conditions) {
                // I swear to god whoever thought it was a good idea for these conditions to reduce every *other* round...
                if (cond.conditionId == "deafened" || cond.conditionId == "blinded" && Number.isNumeric(cond.flags.wfrp4e.roundReceived)) {
                    if ((combat.round - 1) % 2 == cond.flags.wfrp4e.roundReceived % 2) {
                        await turn.actor.removeCondition(cond.conditionId)
                        removedConditions.push(
                            game.i18n.format("CHAT.RemovedConditions", {
                                condition: game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId]),
                                name: turn.actor.token?.name || turn.actor.prototypeToken.name
                            }))
                    }
                }
            }
            await turn.actor.runEffects("endRound", combat, {async: true})

        }
        if (removedConditions.length)
            ChatMessage.create({ content: removedConditions.join("<br>") })
    }

    static async checkEndTurnConditions(combat) {
        if (!game.user.isUniqueGM)
            return

        let combatant = combat.turns[combat.turn]
        if (combatant) {
            let msgContent = ""
            let endTurnConditions = combatant.actor.actorEffects.filter(e => e.conditionTrigger == "endTurn")
            for (let cond of endTurnConditions) {
                if (game.wfrp4e.config.conditionScripts[cond.conditionId]) {
                    let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId])
                    if (Number.isNumeric(cond.flags.wfrp4e.value))
                        conditionName += ` ${cond.flags.wfrp4e.value}`
                    msgContent = `
                <h2>${conditionName}</h2>
                <a class="condition-script" data-combatant-id="${combatant.id}" data-cond-id="${cond.conditionId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>
                `
                    ChatMessage.create({ content: msgContent, speaker: { alias: combatant.token.name } })

                }
            }

            await combatant.actor.runEffects("endTurn", combat)
        }
    }

    static fearReminders(combat) {
        let chatData = { content: game.i18n.localize("CHAT.FearReminder") + "<br><br>", speaker: { alias: game.i18n.localize("CHAT.Fear") } }
        let fearedCombatants = combat.turns.filter(t => t.actor.hasCondition("fear"))
        if (!fearedCombatants.length)
            return

        fearedCombatants.forEach(c => {
            let fear = c.actor.hasCondition("fear")
            chatData.content += `<b>${c.name}</b>`
            if (fear.flags.wfrp4e.fearName)
                chatData.content += ` (${fear.flags.wfrp4e.fearName})`
            chatData.content += "<br>"
        })
        ChatMessage.create(chatData)
    }

    static async clearCombatantAdvantage(combat) {
        if (!game.user.isUniqueGM)
            return

        if (game.settings.get("wfrp4e","useGroupAdvantage")) {
            await WFRP_Utility.updateGroupAdvantage({players : 0, enemies : 0})
        } 

        for (let turn of combat.turns) {
            turn.actor.update({ "system.status.advantage.value": 0 }, {skipGroupAdvantage: true})
            await turn.actor.runEffects("endCombat", combat)
        }

    }
}