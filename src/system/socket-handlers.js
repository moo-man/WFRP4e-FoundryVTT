// Override various socket handling

export default {
    morrslieb: function (payload) {
        canvas.draw();
    },

    target: async function (payload) {
        let scene = game.scenes.get(payload.scene)
        let token = scene.tokens.get(payload.target)
        return await token.actor.update({ "flags.oppose": payload.opposeFlag });
    },

    updateMessage: async function (payload) {
        const msg = game.messages.get(payload.id);
        await msg.update(payload.updateData);
        return "success"
    },

    deleteMessage: async function (payload) {
        return await game.messages.get(payload.id)?.delete()
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
        return game.settings.get("wfrp4e", "groupAdvantageValues");
    },

    createActor: async function (payload) {
        let id = payload.id
        let actorData = payload.data

        // Give ownership to requesting actor
        actorData.ownership = {
            default: 0,
            [id]: 3
        }
        let actor = await Actor.implementation.create(actorData, payload.options || {});
        return actor.id;
    }
}
