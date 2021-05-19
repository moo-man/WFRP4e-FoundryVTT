
import WFRP_Audio from "../system/audio-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";

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

    static preUpdateCombat(combat) {
        if (combat.data.round == 0 && combat.data.turn == 0 && combat.data.active) {
            CombatHelpers.combatChecks(combat, "startCombat")
        }
        if (combat.data.round != 0 && combat.turns && combat.data.active) {
            if (combat.current.turn > -1 && combat.current.turn == combat.turns.length - 1) {
                CombatHelpers.combatChecks(combat, "endRound")
            }
        }

        CombatHelpers.combatChecks(combat, "endTurn")
    }

    static updateCombat(combat) {
        if (combat.data.round != 0 && combat.turns && combat.data.active) {
            CombatHelpers.combatChecks(combat, "startTurn")
        }
    }

    static endCombat(combat) {
        CombatHelpers.combatChecks(combat, "endCombat")
    }


    static startTurnChecks(combat) {
        if (!game.user.isUniqueGM)
            return

        let turn = combat.turns.find(t => t.tokenId == combat.current.tokenId)


        if (turn.actor.hasSystemEffect("dualwielder"))
            turn.actor.removeSystemEffect("dualwielder")

        if (game.settings.get("wfrp4e", "statusOnTurnStart"))
            turn.actor.displayStatus(combat.data.round, turn.name);

        if (game.settings.get("wfrp4e", "focusOnTurnStart")) {
            canvas.tokens.get(turn.token._id).control();
            canvas.tokens.cycleTokens(1, true);
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
            content = `<h2>End Of Combat Reminders</h3>` + content;
            ChatMessage.create({ content, whisper: ChatMessage.getWhisperRecipients("GM") })
        }
    }

    static checkFearTerror(combat) {
        if (!game.user.isUniqueGM)
            return

        let fearCounters = []
        let terrorCounters = [];
        for (let turn of combat.turns) {
            let fear = turn.actor.has(game.i18n.localize("CHAT.Fear"))
            if (fear)
                fearCounters.push({ name: turn.name, value: `@Fear[${fear.data.specification.value},${turn.name}]` })

            let terror = turn.actor.has(game.i18n.localize("CHAT.Terror"))
            if (terror)
                terrorCounters.push({ name: turn.name, value: `@Terror[${terror.data.specification.value},${turn.name}]` })
        }
        if (fearCounters.length || terrorCounters.length) {
            let msg = ""
            if (fearCounters.length)
                msg += `<h2>${game.i18n.localize("CHAT.Fear")}</h2>${fearCounters.map(f => `${f.name} - ${f.value}`).join("<br>")}`
            if (terrorCounters.length)
                msg += `<h2>${game.i18n.localize("CHAT.Terror")}</h2>${terrorCounters.map(t => `${t.name} - ${t.value}`).join("<br>")}`

            ChatMessage.create({ content: msg })
        }
    }


    static checkCorruption(combat) {
        if (!game.user.isUniqueGM)
            return

        let corruptionCounters = []

        for (let turn of combat.turns) {
            let corruption = turn.actor.has(game.i18n.localize("NAME.Corruption"))
            if (corruption) {
                let existing = corruptionCounters.find(c => c.type == corruption.data.specification.value)
                if (existing)
                    existing.counter++;
                else
                    corruptionCounters.push({ counter: 1, type: corruption.data.specification.value })
            }
        }

        let content = ""

        if (corruptionCounters.length) {
            content += `<h3><b>Corruption</b></h3>`
            for (let corruption of corruptionCounters) {
                content += `${corruption.counter} ${corruption.type}<br>`
            }
            content += `<br><b>Click a corruption link to prompt a test for Corruption</b>`
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
            content += `<h3><b>Minor Infections</b></h3>These actors have received Critical Wounds and needs to succeed a <b>Very Easy (+60) Endurance Test</b> or gain a @Compendium[wfrp4e-core.diseases.1hQuVFZt9QnnbWzg]{Minor Infection}.<br>`
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
                let existing = diseaseCounters.find(d => d.type == disease.data.specification.value)
                if (existing)
                    existing.counter++;
                else
                    diseaseCounters.push({ counter: 1, type: disease.data.specification.value })
            }
        }
        let content = ""

        if (diseaseCounters.length) {
            content += `<h3><b>Diseases</b></h3>`
            for (let disease of diseaseCounters)
                content += `${disease.counter} <a class="item-lookup" data-type="disease" data-open="sheet">${disease.type}</a><br>`

            content += `<br>Refer to the diseases for their Contraction Rules`
        }
        return content
    }

    static checkEndRoundConditions(combat) {
        if (!game.user.isUniqueGM)
            return

        let removedConditions = []
        let msgContent = ""
        for (let turn of combat.turns) {
            let endRoundConditions = turn.actor.data.effects.filter(e => getProperty(e, "flags.wfrp4e.trigger") == "endRound")
            for (let cond of endRoundConditions) {
                if (game.wfrp4e.config.conditionScripts[cond.flags.core.statusId]) {
                    let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.flags.core.statusId])
                    if (Number.isNumeric(cond.flags.wfrp4e.value))
                        conditionName += ` ${cond.flags.wfrp4e.value}`
                    msgContent = `
              <h2>${conditionName}</h2>
              <a class="condition-script" data-combatant-id="${turn._id}" data-cond-id="${cond.flags.core.statusId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>
              `
                    ChatMessage.create({ content: msgContent, speaker: { alias: turn.token.name } })

                }
            }

            let conditions = turn.actor.data.effects.filter(e => hasProperty(e, "flags.core.statusId"))
            for (let cond of conditions) {
                // I swear to god whoever thought it was a good idea for these conditions to reduce every *other* round...
                if (cond.flags.core.statusId == "deafened" || cond.flags.core.statusId == "blinded" && Number.isNumeric(cond.flags.wfrp4e.roundReceived)) {
                    if ((combat.round - 1) % 2 == cond.flags.wfrp4e.roundReceived % 2) {
                        turn.actor.removeCondition(cond.flags.core.statusId)
                        removedConditions.push(
                            game.i18n.format("CHAT.RemovedConditions", {
                                condition: game.i18n.localize(game.wfrp4e.config.conditions[cond.flags.core.statusId]),
                                name: turn.actor.token?.name || turn.actor.data.token.name
                            }))
                    }
                }
            }
            turn.actor.runEffects("endRound", combat)

        }
        if (removedConditions.length)
            ChatMessage.create({ content: removedConditions.join("<br>") })
    }

    static checkEndTurnConditions(combat) {
        if (!game.user.isUniqueGM)
            return

        let combatant = combat.turns[combat.turn]
        let endTurnConditions = combatant.actor.data.effects.filter(e => getProperty(e, "flags.wfrp4e.trigger") == "endTurn")
        for (let cond of endTurnConditions) {
            if (game.wfrp4e.config.conditionScripts[effect.flags.core.statusId]) {
                let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.flags.core.statusId])
                if (Number.isNumeric(cond.flags.wfrp4e.value))
                    conditionName += ` ${cond.flags.wfrp4e.value}`
                msgContent = `
            <h2>${conditionName}</h2>
            <a class="condition-script" data-combatant-id="${combatant._id}" data-cond-id="${cond.flags.core.statusId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>
            `
                ChatMessage.create({ content: msgContent, speaker: { alias: combatant.token.name } })

            }
        }

        combatant.actor.runEffects("endTurn", combat)
    }

    static fearReminders(combat)
    {
        let chatData = {content : game.i18n.localize("CHAT.FearReminder") + "<br><br>", speaker : {alias : game.i18n.localize("CHAT.Fear")}}
        let fearedCombatants = combat.turns.filter(t => t.actor.hasCondition("fear"))
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

        for (let turn of combat.turns) {
            turn.actor.update({ "data.status.advantage.value": 0 })
            turn.actor.runEffects("endCombat", combat)
        }
    }
}
