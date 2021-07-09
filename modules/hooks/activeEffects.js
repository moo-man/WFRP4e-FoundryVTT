
export default function () {

    Hooks.on("preCreateActiveEffect", (effect, options, id) => {

        if (getProperty(effect, "flags.wfrp4e.preventDuplicateEffects"))
        {
            if (effect.parent.effects.find(e => e.label == effect.label))
            {
                ui.notifications.notify(`Prevented adding ${effect.label} effect: Effect already exists`)
                return false
            }
        }
                
    })

}