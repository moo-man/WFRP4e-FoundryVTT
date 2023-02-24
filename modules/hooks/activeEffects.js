
export default function () {

    Hooks.on("createActiveEffect", _runUpdateEffects)
    Hooks.on("updateActiveEffect", (effect, update, options, id) => {_runUpdateEffects(effect, options, id)})
    Hooks.on("deleteActiveEffect", _runUpdateEffects)

    Hooks.on("preCreateActiveEffect", (effect, options, id) => {

        if (getProperty(effect, "flags.wfrp4e.preventDuplicateEffects"))
        {
            if (effect.parent?.documentName == "Actor" && effect.parent.effects.find(e => e.label == effect.label))
            {
                ui.notifications.notify(`${game.i18n.format("EFFECT.Prevent", { name: effect.label })}`)
                return false
            }
        }

        if (effect.parent?.documentName == "Actor" && effect.application == "apply")
        {
            effect.updateSource({"flags.wfrp4e.effectApplication" : "actor"})
        }

        if (effect.parent?.documentName == "Actor" && effect.trigger == "oneTime")
        {
            ui.notifications.notify(`${game.i18n.format("EFFECT.Applying", { name: effect.label })}`)
            game.wfrp4e.utility.applyOneTimeEffect(effect, effect.parent);
            return false
        }
                
    })

}

function _runUpdateEffects(effect, options, id)
{
    if (id != game.user.id)
    {
        return;
    }

    if (effect.parent?.documentName == "Actor")
    {
        effect.parent.runEffects("update", {effect}, {async: true})
    }
}