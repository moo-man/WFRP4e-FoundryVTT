import WFRP_Utility from "../../apps/utility-wfrp4e";
import WFRP4E from "../../system/config-wfrp4e"

export default tokenHooks = () => {
  // Adds tooltips to conditions in the condition menu
  Hooks.on("renderTokenHUD", async (obj, html) => {
    for (let condition of html.find("img.effect-control")) {
      condition.title = WFRP_Utility.parseConditions([condition.src])[0]
    }
  })
}