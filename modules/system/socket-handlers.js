import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import EffectWfrp4e from "./effect-wfrp4e.js";

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
        game.wfrp4e.utility.applyEffectToTarget(data.payload.effect, data.payload.targets.map(t => new Token(t)))
    }
    static applyOneTimeEffect(data){
        if (game.user.id != data.payload.userId)
            return

        ui.notifications.notify("Received Apply Effect command for " + data.payload.effect.label)
        let actor = new ActorWfrp4e(data.payload.actorData)
        let effect = new EffectWfrp4e(data.payload.effect)
        let func = new Function("args", effect.script).bind({actor, effect})
        func({actor})
    }
}
