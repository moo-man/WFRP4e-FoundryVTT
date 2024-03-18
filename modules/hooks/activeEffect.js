import AreaHelpers from "../system/area-helpers.js";

export default function() {
    Hooks.on("createActiveEffect", async (effect, data, user) => {
        if(game.user.isUniqueGM && effect.flags?.wfrp4e?.applicationData?.type) {
            if (effect.flags.wfrp4e.applicationData.type == "aura" && (effect.flags.wfrp4e.applicationData.targetedAura == "target" || effect.flags.wfrp4e.applicationData.targetedAura == "all") || 
                effect.flags.wfrp4e.applicationData.type == "area" &&
                game.canvas?.scene) {
                AreaHelpers.checkAreas(game.canvas.scene);
            }
        }
    });
}