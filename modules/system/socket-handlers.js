import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import EffectWfrp4e from "./effect-wfrp4e.js";

export default class SocketHandlers  {

    static call(type, payload, userId)
    {
        game.socket.emit("system.wfrp4e", {type, payload, userId});
    }

    static register()
    {
        game.socket.on("system.wfrp4e", data => 
        {
            this[data.type]({...data.payload}, data.userId);
        });
    }

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

    static applyEffect({effectUuids, effectData, actorUuid, messageId}, userId)
    {
        if (game.user.id == userId)
        {
            return fromUuidSync(actorUuid)?.applyEffect({effectUuids, effectData, messageId});
        }  
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

    /**
     * Not used by sockets directly, but is called when a socket handler should be executed by
     * the specific user which owns a document. Usually used to invoke tests from other users
     * for their assigned Actor. 
     * 
     * @param {Document} document Document on which to test if the user is owner or not
     * @param {String} type Type of socket handler
     * @param {Object} payload Data for socket handler, should generally include document UUID 
     * @returns 
     */
    static executeOnOwner(document, type, payload) {
        let ownerUser = game.wfrp4e.utility.getActiveDocumentOwner(document);
        if (game.user.id == ownerUser.id) {
            return this[type](payload);
        }
        ui.notifications.notify(game.i18n.format("SOCKET.SendingSocketRequest", { name: ownerUser.name }));
        SocketHandlers.call(type, payload, ownerUser.id);
    }
}