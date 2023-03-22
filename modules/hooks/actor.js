export default function() {


    Hooks.on("updateActor", (actor) =>{
        actor.runEffects("update", {}, {async: true})
        actor.checkSize();

    })

    Hooks.on("createActor", (actor) =>{
        actor.runEffects("update", {}, {async: true})
        actor.checkSize();
    })
}
