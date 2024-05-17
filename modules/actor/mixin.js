import WFRP_Utility from "../system/utility-wfrp4e";

/**
 * @param {typeof abstract.Document} cls     The base Document class to be mixed
 * @returns {typeof ClientDocument}           The mixed client-side document class definition
 * @category - Mixins
 * @mixin
 */
const WFRP4eDocumentMixin = (cls) => class extends cls {

    // @@@@ _preHook Listeners @@@@
    async _preCreate(data, options, user) {
        if (data._id && !this.isOwned)
            options.keepId = WFRP_Utility._keepID(data._id, this)

        await super._preCreate(data, options, user)
        this.updateSource(await this.system.preCreateData(data, options, user));
    }

    async _preUpdate(data, options, user) {
        await super._preUpdate(data, options, user)
        await this.system.preUpdateChecks(data, options, user);
        await Promise.all(this.runScripts("preUpdate", {data, options, user}))
}

    async _preDelete(options, user) {
        await super._preDelete(options, user)
        await this.system.preDeleteChecks(options, user);
    }

    _preUpdateDescendantDocuments(parent, collection, changes, options, userId) {
        super._preUpdateDescendantDocuments(parent, collection, changes, options, userId)
    }

    _onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId) {
        super._onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId)
    }

    _preDeleteDescendantDocuments(parent, collection, ids, options, userId) {
        super._preDeleteDescendantDocuments(parent, collection, ids, options, userId)
    }


    // @@@@ _onHook Listeners @@@@
    async _onCreate(data, options, user) {
        if (game.user.id != user) {
            return;
        }
        super._onCreate(data, options, user);

        let update = this.system.createChecks(data, options, user)
        if (!foundry.utils.isEmpty(update)) {
            this.update(update);
        }
    }

    async _onUpdate(data, options, user) {
        await super._onUpdate(data, options, user);
        
        if (game.user.id != user) {
            return;
        }

        let update = this.system.updateChecks(data, options, user)
        if (!foundry.utils.isEmpty(update)) {
            await this.update(update);
        }
        await Promise.all(this.runScripts("update", {data, options, user}))
    }

    async _onDelete(options, user) {
        super._onDelete(options, user);
        this.system.deleteChecks(options, user);
    }

    _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
        super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
    }

    _onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId) {
        super._onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId);
    }

    _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
        super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
    }

    /**
 * 
 * @param {String} trigger Script trigger to run
 * @param {Object} args Arguments for the script
 * 
 * @returns Array of executed script return values
 */
    runScripts(trigger, args, ownerOnly=false) {

        if (ownerOnly && WFRP_Utility.getActiveDocumentOwner(this).id != game.user.id)
        {
            return [];
        }

        let scripts = this.getScripts(trigger);

        let promises = [];

        for (let script of scripts) {
            if (script.async) {
                promises.push(script.execute(args));
            }
            else {
                script.execute(args);
            }
        }

        return promises;
    }

    /**
* Collect effect scripts being applied to the actor
* 
* @param {String} trigger Specify stript triggers to retrieve
* @param {Function} scriptFilter Optional function to filter out more scripts
* @returns 
*/
    getScripts(trigger, scriptFilter) {
        let effects = Array.from(this.allApplicableEffects()).filter(i => !i.disabled);
        let scripts = effects.reduce((prev, current) => prev.concat(current.scripts.filter(i => i.trigger == trigger)), []);
        if (scriptFilter) {
            scripts = scripts.filter(scriptFilter);
        }
        return scripts;
    }

    //#region Condition Handling
    async addCondition(effect, value = 1) {
        if (typeof (effect) === "string")
            effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
        if (!effect)
            return "No Effect Found"

        if (!effect.id)
            return "Conditions require an id field"


        let existing = this.hasCondition(effect.id)

        if (existing && existing.flags.wfrp4e.value == null)
            return existing
        else if (existing) {
            existing = duplicate(existing)
            existing.flags.wfrp4e.value += value;
            return this.updateEmbeddedDocuments("ActiveEffect", [existing])
        }
        else if (!existing) {
            effect.name = game.i18n.localize(effect.name);
            if (Number.isNumeric(effect.flags.wfrp4e.value))
                effect.flags.wfrp4e.value = value;
            delete effect.id
            return this.createEmbeddedDocuments("ActiveEffect", [effect], {condition: true});
        }
    }

    async removeCondition(effect, value = 1) {
        if (typeof (effect) === "string")
            effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
        if (!effect)
            return "No Effect Found"

        if (!effect.id)
            return "Conditions require an id field"

        let existing = this.hasCondition(effect.id)

        if (existing && existing.flags.wfrp4e.value == null) {
            return this.deleteEmbeddedDocuments("ActiveEffect", [existing._id])
        }
        else if (existing) {
            await existing.setFlag("wfrp4e", "value", existing.conditionValue - value);

            if (existing.flags.wfrp4e.value <= 0)
                return this.deleteEmbeddedDocuments("ActiveEffect", [existing._id])
            else
                return this.updateEmbeddedDocuments("ActiveEffect", [existing])
        }
    }


    hasCondition(conditionKey) {
        let existing = this.effects.find(i => i.conditionId == conditionKey)
        return existing
    }

    
    // Assigns a property to all datamodels are their embedded models
    propagateDataModels(model, name, value)
    {
        if (model instanceof foundry.abstract.DataModel && !model[name])
        {
            Object.defineProperty(model, name, {
                value, 
                enumerable : false
            });
        }

        for(let property in model)
        {
            if (model[property] instanceof foundry.abstract.DataModel)
            {
                this.propagateDataModels(model[property], name, value);
            }
        }
    }

}

export default WFRP4eDocumentMixin;