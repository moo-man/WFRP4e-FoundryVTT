import WFRP_Audio from "../system/audio-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";

export default function() {
  /**
   * Displays round/turn summaries as combat turns go by, also focuses on token whose turn is starting
   */
  Hooks.on("updateCombat", (combat) => {
    if (game.user.isGM && combat.data.round != 0 && combat.turns && combat.data.active) {
      let turn = combat.turns.find(t => t.tokenId == combat.current.tokenId)

      if (game.settings.get("wfrp4e", "displayRoundSummary") && combat.current.turn == 0 && combat.current.round != 1)
        WFRP_Utility.displayRoundSummary(combat)

      if (game.settings.get("wfrp4e", "statusOnTurnStart"))
        WFRP_Utility.displayStatus(turn.token._id, combat.data.round);

      if (game.settings.get("wfrp4e", "focusOnTurnStart")) {
        canvas.tokens.get(turn.token._id).control();
        canvas.tokens.cycleTokens(1, true);
      }

      WFRP_Audio.PlayContextAudio({ item: { type: 'round' }, action: "change" })
    }
  })

  /**
   * Remove advantage from all combatants when combat ends
   */
  Hooks.on("deleteCombat", async (combat) => {
    for (let turn of combat.turns) {
      let actor = canvas.tokens.get(turn.tokenId).actor;
      await actor.update({ "data.status.advantage.value": 0 })
    }
  })
}