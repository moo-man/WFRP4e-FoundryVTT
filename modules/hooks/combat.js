import WFRP_Audio from "../system/audio-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP4E from "../system/config-wfrp4e.js";

export default function() {
  /**
   * Displays round/turn summaries as combat turns go by, also focuses on token whose turn is starting
   */
  Hooks.on("updateCombat", (combat, data) => {
    if (game.user.isUniqueGM && combat.data.round != 0 && combat.turns && combat.data.active) {
      let turn = combat.turns.find(t => t.tokenId == combat.current.tokenId)


      if (turn.actor.hasSystemEffect("dualwielder"))
        turn.actor.removeSystemEffect("dualwielder")

      if (game.settings.get("wfrp4e", "statusOnTurnStart"))
        WFRP_Utility.displayStatus(turn.actor, combat.data.round);

      if (game.settings.get("wfrp4e", "focusOnTurnStart")) {
        canvas.tokens.get(turn.token._id).control();
        canvas.tokens.cycleTokens(1, true);
      }

      // if (combat.current.turn > -1)
      // {
      //   let actor = combat.turns[combat.current.turn].actor;
      //   let endTurnEffects = actor.constructor.consolidateEffects(actor.data.effects).filter(e => e.flags.wfrp4e.effectTrigger == "endTurn")
      //   endTurnEffects.forEach(e => {
      //     WFRP4E.conditionScripts[e.flags.wfrp4e.key](actor);
      //   })
      // }

      WFRP_Audio.PlayContextAudio({ item: { type: 'round' }, action: "change" })
    }
  })

  Hooks.on("preUpdateCombat", (combat, data) => {
    if (game.user.isUniqueGM && combat.data.round == 0 && combat.data.turn == 0 && combat.data.active) 
    {
      game.wfrp4e.config.systemScripts.startCombat.fearTerror(combat)
    }




    if (game.user.isUniqueGM && combat.data.round != 0 && combat.turns && combat.data.active) 
    {
      if (combat.current.turn > -1 && combat.current.turn == combat.turns.length-1)
      {
        let removedConditions = []
        let msgContent = ""
        for(let turn of combat.turns)
        {
          let endRoundConditions = turn.actor.data.effects.filter(e => getProperty(e, "flags.wfrp4e.trigger") == "endRound")
          for(let cond of endRoundConditions)
          {
            if (game.wfrp4e.config.conditionScripts[cond.flags.core.statusId])
            {
              let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.flags.core.statusId])
              if (Number.isNumeric(cond.flags.wfrp4e.value))
                conditionName += ` ${cond.flags.wfrp4e.value}`
              msgContent = `
              <h2>${conditionName}</h2>
              <a class="condition-script" data-combatant-id="${turn._id}" data-cond-id="${cond.flags.core.statusId}">${game.i18n.format("CONDITION.Apply", {condition : conditionName})}</a>
              `
              ChatMessage.create({content : msgContent, speaker : { alias : turn.token.name} } )

            }
          }

          let conditions = turn.actor.data.effects.filter(e => hasProperty(e, "flags.core.statusId"))
          for(let cond of conditions)
          {
            // I swear to god whoever thought it was a good idea for these conditions to reduce every *other* round...
            if (cond.flags.core.statusId == "deafened" || cond.flags.core.statusId == "blinded" && Number.isNumeric(cond.flags.wfrp4e.roundReceived))
            {
              if((combat.round - 1) % 2  == cond.flags.wfrp4e.roundReceived % 2)
              {
                turn.actor.removeCondition(cond.flags.core.statusId)
                removedConditions.push(
                  game.i18n.format("CHAT.RemovedConditions", {
                    condition : game.i18n.localize(game.wfrp4e.config.conditions[cond.flags.core.statusId]),
                    name : turn.actor.token?.name || turn.actor.data.token.name
                  }))
              }
            }
          }
          turn.actor.runEffects("endRound", combat)

        }
        if (removedConditions.length)
          ChatMessage.create({content : removedConditions.join("<br>")})


      } 
      
      
      let combatant = game.combat.turns[game.combat.turn]
      let endTurnConditions = combatant.actor.data.effects.filter(e => getProperty(e, "flags.wfrp4e.trigger") == "endTurn")
      for(let cond of endTurnConditions)
      {
        if (game.wfrp4e.config.conditionScripts[effect.flags.core.statusId])
        {
          let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.flags.core.statusId])
          if (Number.isNumeric(cond.flags.wfrp4e.value))
            conditionName += ` ${cond.flags.wfrp4e.value}`
          msgContent = `
          <h2>${conditionName}</h2>
          <a class="condition-script" data-combatant-id="${combatant._id}" data-cond-id="${cond.flags.core.statusId}">${game.i18n.format("CONDITION.Apply", {condition : conditionName})}</a>
          `
          ChatMessage.create({content : msgContent, speaker : { alias : combatant.token.name} } )

        }
      }

      combatant.actor.runEffects("endTurn", combat)

    }
  })

  /**
   * Remove advantage from all combatants when combat ends
   */
  Hooks.on("deleteCombat", async (combat) => {

    if (game.user.isUniqueGM)
    {
      for (let turn of combat.turns) {
        await turn.actor.update({ "data.status.advantage.value": 0 })
        turn.actor.runEffects("endCombat", combat)
      }
  
      let content = ""
  
      for (let script in game.wfrp4e.config.systemScripts.endCombat)
      {
        let scriptResult = game.wfrp4e.config.systemScripts.endCombat[script](combat)
        if (scriptResult)
          content += scriptResult + "<br><br>";
      }
  
      if (content)
      {
        content = `<h2>End Of Combat Reminders</h3>` + content;
        ChatMessage.create({content, whisper: ChatMessage.getWhisperRecipients("GM")})
      }

    }

  })
}