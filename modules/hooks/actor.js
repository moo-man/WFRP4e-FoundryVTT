export default function() {


    Hooks.on("updateActor", (actor) =>{
        if (actor.type != "vehicle")
        actor.checkWounds();
    })
}