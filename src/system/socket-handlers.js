// Override various socket handling

export default function () {

    Object.assign(SocketHandlers, {

        call: function (type, payload, userId){
            if (userId == "GM") {
                if (!game.users.activeGM) {
                    throw new Error("No Active GM present");
                }
                userId = game.users.activeGM.id;
            }
            game.socket.emit("system.wfrp4e", { type, payload, userId });
        },

        register: function (){
            game.socket.on("system.wfrp4e", async data => {
                if (!data.userId) {
                    warhammer.utility.log("userId is missing in socket request, fallback to ALL");
                    data.userId = "ALL";
                }
                if (data.userId != game.user.id && data.userId != "ALL") return;

                let result = await this[data.type]({ ...data.payload }, data.userId);
                if (!data.payload.socketMessageId) return;

                if (!result) {
                    SocketHandlers.deleteMessage({ id: data.payload.socketMessageId });
                } else {
                    data.payload.socketResult = result;
                    SocketHandlers.updateSocketMessageResult(data.payload);
                }
            });
        }.bind(SocketHandlers),

        updateSocketMessageResult: function (payload){
            let message = game.messages.get(payload.socketMessageId);
            if (message && payload.socketResult) {
                message.setFlag("wfrp4e", "socketResult", payload.socketResult);
            }
        },

        morrslieb: function (payload){
            canvas.draw();
        },

        target: async function (payload) {
            let scene = game.scenes.get(payload.scene)
            let token = scene.tokens.get(payload.target)
            await token.actor.update({ "flags.oppose": payload.opposeFlag });
        },

        updateMessage: async function (payload) {
            const msg = game.messages.get(payload.id);
            await msg.update(payload.updateData);
            return "success"
        },

        deleteMessage: async function (payload) {
            game.messages.get(payload.id)?.delete()
        },

        applyEffect: async function ({ effectUuids, effectData, actorUuid, messageId }) {
            let result = await fromUuidSync(actorUuid)?.applyEffect({ effectUuids, effectData, messageId });
            return result;
        },

        applyDamage: async function ({ damage, options, actorUuid }) {
            let result = await fromUuidSync(actorUuid)?.applyBasicDamage(damage, options);
            return result;
        },

        changeGroupAdvantage: async function (payload) {
            if (game.user.isUniqueGM) {
                let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")
                advantage.players = payload.players
                await game.settings.set("wfrp4e", "groupAdvantageValues", advantage);
            }
        },

        createActor: async function (payload) {
            let id = payload.id
            let actorData = payload.data

            // Give ownership to requesting actor
            actorData.ownership = {
                default: 0,
                [id]: 3
            }
            let actor = await Actor.implementation.create(actorData, payload.options || {})
            return actor.id;
        },

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
        executeOnOwner: function (document, type, payload){
            let ownerUser = getActiveDocumentOwner(document);
            if (game.user.id == ownerUser.id) {
                this[type](payload);
            } else {
                warhammer.utility.log(game.i18n.format("SOCKET.SendingSocketRequest", { name: ownerUser.name }));
                SocketHandlers.call(type, payload, ownerUser.id);
            }
        }.bind(SocketHandlers),

        executeOnUserAndWait: async function (userId, type, payload) {
            let result;
            if (game.user.id == userId || (userId == "GM" && game.user.isGM)) {
                result = await this[type](payload);
            } else {
                warhammer.utility.log(game.i18n.format("SOCKET.SendingSocketRequest", { name: userId }));
                let owner = game.users.get(userId) ?? game.users.activeGM;
                let msg = await SocketHandlers.createSocketRequestMessage(owner, "Sending socket message to " + owner?.name + "...");
                payload.socketMessageId = msg.id;
                SocketHandlers.call(type, payload, userId);
                do {
                    await warhammer.utility.sleep(250);
                    msg = game.messages.get(msg.id);
                    result = msg?.getFlag("wfrp4e", "socketResult");
                } while (msg && !result);
                if (msg && game.user.isGM) {
                    msg.delete();
                } else if (msg && !game.user.isGM) {
                    SocketHandlers.call("deleteMessage", { "id": msg.id }, "GM");
                }
            }
            return result;
        }.bind(SocketHandlers),

        executeOnOwnerAndWait: async function (document, type, payload) {
            let ownerUser = getActiveDocumentOwner(document);
            return await SocketHandlers.executeOnUserAndWait(ownerUser.id, type, payload);
        },


        createSocketRequestMessage: async function (owner, content) {
            let chatData = {
                content: `<p class='requestmessage'><b><u>${owner?.name}</u></b>: ${content}</p?`,
                whisper: ChatMessage.getWhisperRecipients("GM")
            }
            if (game.user.isGM) {
                chatData.user = owner;
            }
            let msg = await ChatMessage.create(chatData);
            return msg;
        }
    });
}
