import passengerRender from "../system/passengerRender.js"
import WFRPTokenHUD from "../apps/tokenHUD.js";

export default function() {

  Hooks.on("canvasReady", (canvas) => {

    if (!(game.modules.get("fxmaster") && game.modules.get("fxmaster").active)) {
      let morrsliebActive = canvas.scene.getFlag("wfrp4e", "morrslieb")
      if (morrsliebActive) {
        if (!canvas.primary.filters)
          canvas.primary.filters = [];
        canvas.primary.filters.push(CONFIG.Morrslieb)
      } 
      else if (canvas.primary.filters?.length)
      {
        // If morrslieb is not active, remove any morrslieb filters
        canvas.primary.filters = canvas.primary.filters.filter(i => !i.morrslieb)
      }
    }

    canvas.hud.token = new WFRPTokenHUD();
  })
}