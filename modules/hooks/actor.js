export default function() {


    Hooks.on("updateActor", (actor) =>{
        actor.runEffects("update", {}, {async: true})
    })
}
