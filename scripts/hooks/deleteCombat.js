/**
 * Remove advantage from all combatants when combat ends
 */
Hooks.on("deleteCombat", async (combat) => {
    for (let turn of combat.turns)
    {
      let actor = canvas.tokens.get(turn.tokenId).actor;
      await actor.update({"data.status.advantage.value" : 0})
    }
  })