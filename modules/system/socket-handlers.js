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

    static async setupSocket(data) {
        let actorId = data.payload.actorId; 
        let type = data.payload.type;
        let options = data.payload.options || {};
        let messageId = data.payload.messageId;
        let actor = game.actors.get(actorId);
        let owner = game.wfrp4e.utility.getActorOwner(actor);

        let test;
        if (owner.id == game.user.id) {
            if (canvas.scene) { 
                if (options.gmTargets) {
                    game.user.updateTokenTargets(options.gmTargets);
                    game.user.broadcastActivity({targets: options.gmTargets});
                } else {
                    game.user.updateTokenTargets([]);
                    game.user.broadcastActivity({targets: []});
                }
            }
            if (type == "setupCharacteristic") {
                let characteristicId = data.payload.characteristicId;
                test = await actor.setupCharacteristic(characteristicId, options);
            } else if (type == "setupSkill") {
                let skillName = data.payload.skillName;
                test = await actor.setupSkill(skillName, options);
            } else if (type == "setupWeapon") {
                let weapon = data.payload.weapon;
                test = await actor.setupWeapon(weapon, options);
            } else if (type == "setupCast") {
                let spell = data.payload.spell;
                test = await actor.setupCast(spell, options);
            } else if (type == "setupChannell") {
                let spell = data.payload.spell;
                test = await actor.setupChannell(spell, options);
            } else if (type == "setupPrayer") {
                let prayer = data.payload.prayer;
                test = await actor.setupPrayer(prayer, options);
            } else if (type == "setupTrait") {
                let trait = data.payload.trait;
                test = await actor.setupTrait(trait, options);
            }
            let message = game.messages.get(messageId);        
            await message.update({"flags.data.test": test});
        }
    }

}
