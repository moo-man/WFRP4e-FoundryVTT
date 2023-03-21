import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import EffectWfrp4e from "./effect-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";

export default class SocketHandlers  {
    static morrslieb(data){
        canvas.draw();
    }
    static target(data){
        if (!game.user.isUniqueGM)
            return
        let scene = game.scenes.get(data.payload.scene)
        let token = scene.tokens.get(data.payload.target)
        token.actor.update(
          {
            "flags.oppose": data.payload.opposeFlag
          })
    }
    static updateMsg(data){
        if (!game.user.isUniqueGM)
            return
        game.messages.get(data.payload.id).update(data.payload.updateData)
    }
    static deleteMsg(data){
        if (!game.user.isUniqueGM)
            return
        game.messages.get(data.payload.id).delete()
    }
    static applyEffects(data){
        if (!game.user.isUniqueGM)
            return
        game.wfrp4e.utility.applyEffectToTarget(data.payload.effect, data.payload.targets.map(t => new TokenDocument(t, {parent: game.scenes.get(data.payload.scene)})))
    }
    static applyOneTimeEffect(data){
        if (game.user.id != data.payload.userId)
            return

        ui.notifications.notify("Received Apply Effect command for " + data.payload.effect.label)
        let actor = new ActorWfrp4e(data.payload.actorData)
        let effect = new EffectWfrp4e(data.payload.effect)
        
        game.wfrp4e.utility.runSingleEffect(effect, actor, null, {actor}, { async: true});
    }
    static changeGroupAdvantage(data){
        if (!game.user.isGM || !game.settings.get("wfrp4e", "useGroupAdvantage")) 
            return

        let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")

        advantage.players = data.payload.players

        // Don't let players update enemy advantage
        
        game.settings.set("wfrp4e", "groupAdvantageValues", advantage)
    }

    static async createActor(data) 
    {
        if (game.user.isUniqueGM)
        {
            let id = data.payload.id
            let actorData = data.payload.data

            // Give ownership to requesting actor
            actorData.ownership = {
                default: 0,
                [id] : 3
            }
            let actor = await Actor.implementation.create(actorData)
            let items = data.payload.items
            actor.createEmbeddedDocuments("Item", items)
        }
    }
}