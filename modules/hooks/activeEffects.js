
export default function () {

    Hooks.on("createActiveEffect", async (effect, options, id) => {await _runUpdateEffects(effect, "create", options, id)})
    Hooks.on("updateActiveEffect", async (effect, options, id) => {await _runUpdateEffects(effect, "update", options, id)})
    Hooks.on("deleteActiveEffect", async (effect, options, id) => {
        if (effect.parent.documentName == "Actor")
        {
            let items = effect.parent.items.filter(i => i.getFlag("wfrp4e", "fromEffect") == effect.id);
            if (items.length)
            {
                ui.notifications.notify(game.i18n.format("EFFECT.DeletingItems", {items : items.map(i => i.name).join(", ")}))
                await effect.parent.deleteEmbeddedDocuments("Item", items.map(i => i.id));
            }
        }
        await _runUpdateEffects(effect, "delete", options, id)
    })

    Hooks.on("preCreateActiveEffect", async (effect, data, options, id) => {

        if (getProperty(effect, "flags.wfrp4e.preventDuplicateEffects"))
        {
            if (effect.parent?.documentName == "Actor" && effect.parent.effects.find(e => e.label == effect.label))
            {
                ui.notifications.notify(`${game.i18n.format("EFFECT.Prevent", { name: effect.label })}`)
                return false
            }
        }

        if (effect.parent?.documentName == "Actor" && effect.trigger == "addItems")
        {
            await game.wfrp4e.utility.applyOneTimeEffect(effect, effect.parent);
            options.keepId = true;
        }
        

        if (effect.item)
        {
            return
        }

        // Below this only applies to effects that have been dragged from items directly

        if (effect.parent?.documentName == "Actor" && effect.application == "apply")
        {
            effect.updateSource({"flags.wfrp4e.effectApplication" : "actor"})
        }

        if (effect.parent?.documentName == "Actor" && effect.trigger == "oneTime")
        {
            ui.notifications.notify(`${game.i18n.format("EFFECT.Applying", { name: effect.label })}`)
            await game.wfrp4e.utility.applyOneTimeEffect(effect, effect.parent);
            return false
        }
                
    })

}

async function _runUpdateEffects(effect, context, options, id)
{
    if (id != game.user.id)
    {
        return;
    }

    if (effect.parent?.documentName == "Actor")
    {
        await effect.parent.runEffects("update", {effect, context});
    }
}