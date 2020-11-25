import WFRP4E from "../system/config-wfrp4e.js"

export default function () {

    // Hooks.on("preCreateActiveEffect", (actor, effect, options, id) => {

    //     if (!effect["flags.core.statusId"])
    //         return
    //     let [effectId, value] = effect["flags.core.statusId"].split("-")
    //     let wfrpEffect = duplicate(WFRP4E.activeEffects[effectId]);
        
    //     for (let key in wfrpEffect)
    //         effect[key] = wfrpEffect[key]

    //     setProperty(effect, "flags.core.statusId", effect["flags.core.statusId"])

    //     effect.flags.wfrp4e.value = Number(value)
    // })

}