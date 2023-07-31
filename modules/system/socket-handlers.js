import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import EffectWfrp4e from "./effect-wfrp4e.js";

export default class SocketHandlers  {

    static updateSocketMessageFlag(data) {
        let message = game.messages.get(data.payload.socketMessageId);
        if (message) {
            if (game.user.isGM) {
                message.delete();
            } else {
                game.socket.emit("system.wfrp4e", { type: "deleteMsg", payload: { "id": message.id } })
            }
        }
    }

    static morrslieb(data){
        canvas.draw();
    }

    static target(data){
        if (!game.user.isUniqueGM)
            return
        let scene = game.scenes.get(data.payload.scene)
        let token = scene.tokens.get(data.payload.target)
        token.actor.update({ "flags.oppose": data.payload.opposeFlag })
            .then(() => { SocketHandlers.updateSocketMessageFlag(data) });
    }

    static updateMsg(data){
        if (!game.user.isUniqueGM)
            return
        const msg = game.messages.get(data.payload.id);
        msg.update(data.payload.updateData)
            .then(() => { SocketHandlers.updateSocketMessageFlag(data) });
    }

    static deleteMsg(data){
        if (!game.user.isUniqueGM)
            return
        const msg = game.messages.get(data.payload.id)
        msg.delete()
            .then(() => { SocketHandlers.updateSocketMessageFlag(data) });
    }

    static applyEffects(data) {
        if (!game.user.isUniqueGM)
            return
        const targets = data.payload.targets.map(t => new TokenDocument(t, {parent: game.scenes.get(data.payload.scene)}));
        game.wfrp4e.utility.applyEffectToTarget(data.payload.effect, targets)
            .then(() => { SocketHandlers.updateSocketMessageFlag(data) });
    }

    static applyOneTimeEffect(data) {
        if (game.user.id != data.payload.userId)
            return
        
        let notification = "Received Apply Effect"
        if (data.payload.effect.flags?.wfrp4e?.hide !== true) 
          notification +=  ` for ${data.payload.effect.name}`
        ui.notifications.notify(notification)

        let actor = new ActorWfrp4e(data.payload.actorData)
        let effect = new EffectWfrp4e(data.payload.effect)
        
        game.wfrp4e.utility.runSingleEffect(effect, actor, null, {actor})
            .then(() => { SocketHandlers.updateSocketMessageFlag(data) });
    }

    static changeGroupAdvantage(data) {
        if (!game.user.isGM || !game.settings.get("wfrp4e", "useGroupAdvantage")) 
            return

        let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")

        advantage.players = data.payload.players

        // Don't let players update enemy advantage
        
        game.settings.set("wfrp4e", "groupAdvantageValues", advantage)
    }

    static async createActor(data) {
        if (game.user.isUniqueGM) {
            let id = data.payload.id
            let actorData = data.payload.data

            // Give ownership to requesting actor
            actorData.ownership = {
                default: 0,
                [id] : 3
            }
            let actor = await Actor.implementation.create(actorData)
            let items = data.payload.items
            await actor.createEmbeddedDocuments("Item", items)
            SocketHandlers.updateSocketMessageFlag(data);
        }
    }
}