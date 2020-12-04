import WFRP_Audio from "../system/audio-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP4E from "../system/config-wfrp4e.js";

export default function() {
  /**
   * Displays round/turn summaries as combat turns go by, also focuses on token whose turn is starting
   */
  Hooks.on("updateCombat", (combat, data) => {
    if (game.user.isGM && combat.data.round != 0 && combat.turns && combat.data.active) {
      let turn = combat.turns.find(t => t.tokenId == combat.current.tokenId)

      if (game.settings.get("wfrp4e", "displayRoundSummary") && combat.current.turn == 0 && combat.current.round != 1)
        //WFRP_Utility.displayRoundSummary(combat)

      if (game.settings.get("wfrp4e", "statusOnTurnStart"))
        WFRP_Utility.displayStatus(turn.actor, combat.data.round);

      if (game.settings.get("wfrp4e", "focusOnTurnStart")) {
        canvas.tokens.get(turn.token._id).control();
        canvas.tokens.cycleTokens(1, true);
      }

      // if (combat.current.turn > -1)
      // {
      //   let actor = combat.turns[combat.current.turn].actor;
      //   let endTurnEffects = actor.constructor.consolidateEffects(actor.data.effects).filter(e => e.flags.wfrp4e.trigger == "endTurn")
      //   endTurnEffects.forEach(e => {
      //     WFRP4E.conditionScripts[e.flags.wfrp4e.key](actor);
      //   })
      // }

      WFRP_Audio.PlayContextAudio({ item: { type: 'round' }, action: "change" })
    }
  })

  Hooks.on("preUpdateCombat", (combat, data) => {
    if (game.user.isGM && combat.data.round != 0 && combat.turns && combat.data.active) 
    {
      if (combat.current.turn > -1 && combat.current.turn == combat.turns.length-1)
      {
        for(let turn of combat.turns)
        {
          let endRoundEffects = turn.actor.data.effects.filter(e => getProperty(e, "flags.wfrp4e.trigger") == "endRound")
          for(let effect of endRoundEffects)
          {
            game.wfrp4e.config.conditionScripts[effect.flags.core.statusId](turn.actor);
          }
        }
      } 
      
      
      let endTurnEffects = game.combat.turns[game.combat.turn].actor.data.effects.filter(e => getProperty(e, "flags.wfrp4e.trigger") == "endTurn")
      for(let effect of endTurnEffects)
      {
        game.wfrp4e.config.conditionScripts[effect.flags.core.statusId](game.combat.turns[game.combat.turn].actor);
      }
    }
  })

  /**
   * Remove advantage from all combatants when combat ends
   */
  Hooks.on("deleteCombat", async (combat) => {
    for (let turn of combat.turns) {
      await turn.actor.update({ "data.status.advantage.value": 0 })
    }

    let corruptionCounters = []

    for(let turn of combat.turns) {
      let corruption = turn.actor.data.traits.find(t => t.name == game.i18n.localize("NAME.Corruption"))
      if (corruption)
      {
        let existing = corruptionCounters.find(c => c.type == corruption.data.specification.value)
        if (existing)
          existing.counter++;
        else 
          corruptionCounters.push({counter : 1, type : corruption.data.specification.value})
      }
    }

    let content = 
    `
    <h2>End Of Combat Reminders</h3>
    `

    if (corruptionCounters.length)
    {
      content += `<h3><b>Corruption<b></h3>`
      for(let corruption of corruptionCounters)
      {
        content+=`${corruption.counter} ${corruption.type}<br>`
      }
      content+= `<br><b>Click a corruption link to prompt a test for Corruption`
      content += `<br>@Corruption[Minor]<br>@Corruption[Moderate]<br>@Corruption[Major]`
    }

    ChatMessage.create({content, whisper: ChatMessage.getWhisperRecipients("GM")})
  })
}