import CombatHelpers from "../system/combat.js"

export default function() {
  Hooks.on("updateCombat", CombatHelpers.updateCombat)
  Hooks.on("preUpdateCombat", CombatHelpers.preUpdateCombat)
  Hooks.on("deleteCombat", CombatHelpers.endCombat)
}