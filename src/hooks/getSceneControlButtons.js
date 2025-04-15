import WFRP_Utility from "../system/utility-wfrp4e.js";
import canvas from "./canvas.js";

export default function() {
  /**
   * Add Status right click option for combat tracker combatants
   */
  Hooks.on("getSceneControlButtons", (buttons) => {
    buttons.lighting.tools.morrslieb = {
      button: true,
      icon: "fas fa-circle",
      name: "morrslieb",
      title: game.canvas.scene?.getFlag("wfrp4e", "morrslieb") ? "Morrslieb - Currently On " : "Morrslieb - Currently Off",
      onClick: WFRP_Utility.toggleMorrslieb
    }
  })
}