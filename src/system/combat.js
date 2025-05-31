import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

export default class CombatHelpersWFRP {


    static registerHelpers() 
    {
        CombatHelpers.startCombat = [CombatHelpersWFRP.checkFearTerror];
        CombatHelpers.endCombat = [CombatHelpersWFRP.clearCombatantAdvantage, CombatHelpersWFRP.checkCorruption, CombatHelpersWFRP.checkInfection, CombatHelpersWFRP.checkDiseases];
        CombatHelpers.startTurn = [CombatHelpersWFRP.checkStartTurnConditions];
        CombatHelpers.endTurn = [CombatHelpersWFRP.checkEndTurnConditions];
        CombatHelpers.endRound = [CombatHelpersWFRP.checkEndRoundConditions, CombatHelpersWFRP.fearReminders];
    }


    static async checkStartTurnConditions(combat) {
        if (!game.user.isUniqueGM)
            return

        
        let combatant = combat.combatant
        console.log("start turn conditions " + combatant.name)
        if (combatant) {
            if (combatant.actor.hasSystemEffect("dualwielder")) {
                await combatant.actor.removeSystemEffect("dualwielder");
            }

            if (game.settings.get("wfrp4e", "focusOnTurnStart")) {
                canvas.tokens.get(combatant.token.id).control();
                canvas.tokens.cycleTokens(1, true);
            }

            let msgContent = ""
            let startTurnConditions = combatant.actor.effects.contents.filter(e => e.system.condition.trigger == "startTurn")
            for (let cond of startTurnConditions) {
                    let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId])
                    if (Number.isNumeric(cond.system.condition.value))
                        conditionName += ` ${cond.system.condition.value}`
                    msgContent = `
                <h2>${conditionName}</h2>
                <a class="chat-button" data-action="conditionScript" data-combatant-id="${combatant.id}" data-cond-id="${cond.conditionId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>`
                    await ChatMessage.create({ content: msgContent, speaker: { alias: combatant.token.name } })
            }

        }
        WFRP_Audio.PlayContextAudio({ item: { type: 'round' }, action: "change" })
    }

    static async checkEndTurnConditions(combat) {
        if (!game.user.isUniqueGM)
            return
        let combatant = combat.combatants.get(combat.previous.combatantId);
        console.log("end turn conditions " + combatant.name)
        if (combatant) {
            let msgContent = ""
            let endTurnConditions = combatant.actor.effects.contents.filter(e => e.system.condition.trigger == "endTurn")
            for (let cond of endTurnConditions) {
                    let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId])
                    if (Number.isNumeric(cond.system.condition.value))
                        conditionName += ` ${cond.system.condition.value}`
                    msgContent = `
                <h2>${conditionName}</h2>
                <a class="chat-button" data-action="conditionScript" data-combatant-id="${combatant.id}" data-cond-id="${cond.conditionId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>`
                    await ChatMessage.create({ content: msgContent, speaker: { alias: combatant.token.name } })
            }
        }
    }

    static async endCombat(combat) {
        if (!game.user.isUniqueGM)
            return

        let content = ""
        let scriptResult = "";
        for (let script of CombatHelpersWFRP.scripts.endCombat) {
            scriptResult = await script(combat);
            if (scriptResult) {
                content += scriptResult + "<br><br>";
            }
        }
        if (content) {
            content = `<h2>${game.i18n.localize("CHAT.EndCombat")}</h3>` + content;
            ChatMessage.create({ content, whisper: ChatMessage.getWhisperRecipients("GM") })
        }
        for (let turn of combat.turns) {
            await Promise.all(turn.actor.runScripts("endCombat", {combat}, true));
            Hooks.callAll("wfrp4e:endCombat", combat);
        }
    }

    static async checkFearTerror(combat) {
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
            catch (e) {
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

        msg += CombatHelpersWFRP.checkSizeFearTerror(combat)

        if (msg)
            await ChatMessage.create(game.wfrp4e.utility.chatDataSetup(msg, "gmroll"))
    }

    static checkSizeFearTerror(combat) {
        let sizeMap = {}
        let msg = ""
        for (let turn of combat.turns) 
        {
            sizeMap[turn.id] = turn.actor?.sizeNum || 3
        }
        for (let id in sizeMap) {
            let combatant = combat.combatants.get(id);
            let size = sizeMap[id]
            let smallerBy = {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: []
            }

            for (let otherCombatantId in sizeMap) {
                let otherCombatant = combat.combatants.get(otherCombatantId);
                let bothFriendly =  (combatant.token?.disposition == otherCombatant.token?.disposition == 1)
                if (otherCombatantId == id || bothFriendly)
                {
                    continue
                }
                try 
                {
                    if (size > sizeMap[otherCombatantId])
                    {
                        smallerBy[size - sizeMap[otherCombatantId]].push(otherCombatant.name)
                    }
                }
                catch (e) {

                }
            }

            let actor = combatant.name;
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

            if (Object.values(smallerBy).some(list => list.length)) {
                msg += "<br>"
            }
        }
        if (msg) {
            msg = `<br><h2>${game.i18n.localize("Size")}</h2>${msg}`
        }
        return msg
    }

    static async checkCorruption(combat) {
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

    static async checkInfection(combat) {
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

    static async checkDiseases(combat) {
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
            let endRoundConditions = turn.actor.effects.contents.filter(e => e.system.condition.trigger == "endRound")
            for (let cond of endRoundConditions) {
                let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId])
                if (Number.isNumeric(cond.system.condition.value))
                    conditionName += ` ${cond.system.condition.value}`
                msgContent = `
            <h2>${conditionName}</h2>
            <a class="chat-button" data-action="conditionScript" data-combatant-id="${turn.id}" data-cond-id="${cond.conditionId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>`
                await ChatMessage.create({ content: msgContent, speaker: { alias: turn.token.name } });
            }

            let conditions = turn.actor.effects.contents.filter(e => e.isCondition)
            for (let cond of conditions) {
                // I swear to god whoever thought it was a good idea for these conditions to reduce every *other* round...
                if (cond.conditionId == "deafened" || cond.conditionId == "blinded" && Number.isNumeric(cond.flags.wfrp4e.roundReceived)) {
                    if ((combat.round) % 2 == cond.flags.wfrp4e.roundReceived % 2) {
                        await turn.actor.removeCondition(cond.conditionId)
                        removedConditions.push(
                            game.i18n.format("CHAT.RemovedConditions", {
                                condition: game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId]),
                                name: turn.actor.token?.name || turn.actor.prototypeToken.name
                            }))
                    }
                }
            }
        }
        if (removedConditions.length)
            await ChatMessage.create({ content: removedConditions.join("<br>") })
    }

    static async fearReminders(combat) {
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
        await ChatMessage.create(chatData)
    }

    static async clearCombatantAdvantage(combat) {
        if (!game.user.isUniqueGM)
            return

        if (game.settings.get("wfrp4e","useGroupAdvantage")) {
            await WFRP_Utility.updateGroupAdvantage({players : 0, enemies : 0})
        } 

        for (let turn of combat.turns) {
            await turn.actor.update({ "system.status.advantage.value": 0 }, {skipGroupAdvantage: true})
        }
    }
}