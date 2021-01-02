
export default function () {

    Hooks.on("preCreateActiveEffect", (actor, effect, options, id) => {

        if (getProperty(effect, "flags.wfrp4e.preventDuplicateEffects"))
        {
            if (actor.data.effects.find(e => e.label == effect.label))
            {
                ui.notifications.notify(`Prevented adding ${effect.label} effect: Effect already exists`)
                return false
            }
        }
                
    })

}