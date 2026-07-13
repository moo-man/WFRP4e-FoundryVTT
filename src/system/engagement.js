
export default class EngagementTracker {

    static _clearing = false;
    static _disengaging = new Set();

    static get setting() {
        return game.settings.get("wfrp4e", "autoEngaged");
    }

    static get engagements() {
        return game.combat?.getFlag("wfrp4e", "engagements") || {};
    }

    /**
     * Mark two actors as engaged with each other and apply the Engaged condition to both.
     */
    static async engage(attacker, defender) {
        if (!this.setting || !game.combat?.active) return;

        let engagements = foundry.utils.deepClone(this.engagements);

        if (!engagements[attacker.id]) engagements[attacker.id] = [];
        if (!engagements[defender.id]) engagements[defender.id] = [];

        if (!engagements[attacker.id].includes(defender.id))
            engagements[attacker.id].push(defender.id);
        if (!engagements[defender.id].includes(attacker.id))
            engagements[defender.id].push(attacker.id);

        await game.combat.setFlag("wfrp4e", "engagements", engagements);

        if (!attacker.hasCondition("engaged"))
            await attacker.addCondition("engaged");
        if (!defender.hasCondition("engaged"))
            await defender.addCondition("engaged");
    }

    /**
     * Remove an actor from all engagement tracking and cascade:
     * any former partner left with no remaining engagements also loses Engaged.
     *
     * @param {Actor} actor
     * @param {object} options
     * @param {boolean} options.suppressConditionRemoval  True when the Engaged condition is already
     *   being deleted (e.g. called from deleteActiveEffect), so we skip the removeCondition call.
     */
    static async disengage(actor, {suppressConditionRemoval = false} = {}) {
        if (!this.setting || !game.combat?.active) return;
        if (this._disengaging.has(actor.id)) return;

        this._disengaging.add(actor.id);
        try {
            let engagements = foundry.utils.deepClone(this.engagements);
            let partners = engagements[actor.id] || [];

            // Compute filtered partner lists upfront — used for both flag update and cascade check.
            let filteredLists = {};
            for (let partnerId of partners) {
                filteredLists[partnerId] = (engagements[partnerId] || []).filter(id => id != actor.id);
            }

            // Update flags: explicitly delete actor's entry and overwrite partner arrays.
            // setFlag merges into the existing object — without the -=key prefix the deleted
            // actor entry would be preserved server-side, causing stale engagements.
            let flagUpdate = {};
            flagUpdate[`flags.wfrp4e.engagements.-=${actor.id}`] = null;
            for (let [partnerId, filtered] of Object.entries(filteredLists)) {
                flagUpdate[`flags.wfrp4e.engagements.${partnerId}`] = filtered;
            }
            await game.combat.update(flagUpdate);

            if (!suppressConditionRemoval && actor.hasCondition("engaged")) {
                await actor.removeCondition("engaged");
            }

            // Partners with no remaining engagements lose the condition
            for (let partnerId of partners) {
                let partner = game.actors.get(partnerId);
                if (!partner) continue;
                if ((filteredLists[partnerId]?.length ?? 0) == 0 && partner.hasCondition("engaged")) {
                    this._disengaging.add(partner.id);
                    try {
                        await partner.removeCondition("engaged");
                    } finally {
                        this._disengaging.delete(partner.id);
                    }
                }
            }
        } finally {
            this._disengaging.delete(actor.id);
        }
    }

    /**
     * Flee: disengage the actor (same cascade logic as disengage).
     */
    static async flee(actor) {
        await this.disengage(actor);
    }

    /**
     * Called when combat ends — strip all tracked Engaged conditions and clear flags.
     * Receives the combat document from CombatHelpers.endCombat.
     */
    static async clearAll(combat) {
        if (!game.settings.get("wfrp4e", "autoEngaged")) return;

        EngagementTracker._clearing = true;
        try {
            let engagements = combat.getFlag("wfrp4e", "engagements") || {};
            for (let actorId of Object.keys(engagements)) {
                let actor = game.actors.get(actorId);
                if (actor?.hasCondition("engaged")) {
                    await actor.removeCondition("engaged");
                }
            }
            await combat.unsetFlag("wfrp4e", "engagements");
        } finally {
            EngagementTracker._clearing = false;
        }
    }
}
