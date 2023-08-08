export default function() {


    Hooks.on("updateActor", (actor) =>{
        actor.runEffects("update", {})
        actor.checkSize();

    })

    Hooks.on("createActor", async (actor) =>{
        actor.runEffects("update", {})
        actor.checkSize();
    })
}
