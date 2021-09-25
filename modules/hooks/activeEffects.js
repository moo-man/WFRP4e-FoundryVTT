
export default function () {

    Hooks.on("preCreateActiveEffect", (effect, options, id) => {

        if (getProperty(effect, "flags.wfrp4e.preventDuplicateEffects"))
        {
            if (effect.parent.effects.find(e => e.label == effect.label))
            {
                ui.notifications.notify(`${game.i18n.localize("EFFECT.Prevent1")} ${effect.label} ${game.i18n.localize("EFFECT.Prevent2")}`)
                return false
            }
        }
                
    })

}