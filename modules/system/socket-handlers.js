import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import WeaponDialog from "../apps/roll-dialog/weapon-dialog.js";
import EffectWfrp4e from "./effect-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

export default class SocketHandlers  {

    static call(type, payload, userId)
    {
        if (userId == "GM") {
            userId = game.users.activeGM.id;
        }
        game.socket.emit("system.wfrp4e", {type, payload, userId});
    }

    static register()
    {
        game.socket.on("system.wfrp4e", async data => 
        {
            if (!data.userId) {
                WFRP_Utility.log("userId is missing in socket request, fallback to ALL"); 
                data.userId = "ALL";
            }
            if (data.userId != game.user.id && data.userId != "ALL") return;

            let result = await this[data.type]({...data.payload}, data.userId);
            if (!data.payload.socketMessageId) return;

            if (!result) {
                SocketHandlers.deleteMsg({id: data.payload.socketMessageId});
            } else {
                data.payload.socketResult = result;
                SocketHandlers.updateSocketMessageResult(data.payload);
            }
        });
    }

    static updateSocketMessageResult(payload) {
        let message = game.messages.get(payload.socketMessageId);
        if (message && payload.socketResult) {
            message.setFlag("wfrp4e", "socketResult", payload.socketResult);
        }
    }

    static morrslieb(payload){
        canvas.draw();
    }

    static async target(payload){
        let scene = game.scenes.get(payload.scene)
        let token = scene.tokens.get(payload.target)
        await token.actor.update({ "flags.oppose": payload.opposeFlag });
    }

    static async updateMsg(payload){
        const msg = game.messages.get(payload.id);
        await msg.update(payload.updateData);
        return "success"
    }

    static async deleteMsg(payload) {
        const msg = game.messages.get(payload.id);
        if (msg) {
            await msg.delete();
        }
    }

    static async applyEffect({effectUuids, effectData, actorUuid, messageId}) {
        let result = await fromUuidSync(actorUuid)?.applyEffect({effectUuids, effectData, messageId});
        return result;
    }

    static async applyDamage({damage, options, actorUuid}) {
        let result = await fromUuidSync(actorUuid)?.applyBasicDamage(damage, options);
        return result;
    }

    static async changeGroupAdvantage(payload) {
        let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")
        advantage.players = payload.players        
        await game.settings.set("wfrp4e", "groupAdvantageValues", advantage);
    }

    static async createActor(payload) {
        let id = payload.id
        let actorData = payload.data

        // Give ownership to requesting actor
        actorData.ownership = {
            default: 0,
            [id] : 3
        }
        let actor = await Actor.implementation.create(actorData)
        return actor.id;        
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
            this[type](payload);
        } else {
            WFRP_Utility.log(game.i18n.format("SOCKET.SendingSocketRequest", { name: ownerUser.name }));
            SocketHandlers.call(type, payload, ownerUser.id);
        }
    }

    static async executeOnUserAndWait(userId, type, payload) {
        let result;
        if (game.user.id == userId || (userId == "GM" && game.user.isGM)) {
            result = await this[type](payload);
        } else {
            WFRP_Utility.log(game.i18n.format("SOCKET.SendingSocketRequest", { name: userId }));
            let owner = game.users.get(userId) ?? game.users.activeGM;
            let msg = await SocketHandlers.createSocketRequestMessage(owner, "Sending socket message to " + owner.name + "...");
            payload.socketMessageId = msg.id;
            SocketHandlers.call(type, payload, userId);
            do {
                await game.wfrp4e.utility.sleep(250);
                msg = game.messages.get(msg.id);
                result = msg?.getFlag("wfrp4e", "socketResult");
            } while (msg && !result);
            if (msg && game.user.isGM) {
                msg.delete();
            } else if (msg && !game.user.isGM) {
                SocketHandlers.call("deleteMsg", { "id": msg.id }, "GM");
            }
        }
        return result;
    }

    static async executeOnOwnerAndWait(document, type, payload) {
        let ownerUser = game.wfrp4e.utility.getActiveDocumentOwner(document);
        return await SocketHandlers.executeOnUserAndWait(ownerUser.id, type, payload);
    }


    static async createSocketRequestMessage(owner, content) {
        let chatData = {
          content: `<p class='requestmessage'><b><u>${owner.name}</u></b>: ${content}</p?`,
          whisper: ChatMessage.getWhisperRecipients("GM")
        }
        if (game.user.isGM) {
          chatData.user = owner;
        }
        let msg = await ChatMessage.create(chatData);
        return msg;
    }
}