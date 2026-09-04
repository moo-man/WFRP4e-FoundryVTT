    export default class RollDialog5e extends WarhammerRollDialogV2 {

    static DEFAULT_OPTIONS = {
        position: {
            width: 600
        },
        actions: {
            clickState : {buttons: [0, 2], handler: this._onClickState}
        }
    };


    get tooltipConfig() 
    {
        return {

            SL: {
                label: "DIALOG.SL",
                type: 1, 
                path: "fields.SL"
            },
            advantage: {
                label: "DIALOG.Advantage",
                type: 1, 
                path: "fields.advantage"
            },
            disadvantage: {
                label: "DIALOG.Disadvantage",
                type: 1, 
                path: "fields.disadvantage"
            },

            // Keep old fields for backwards compatibility
            modifier: {
                label: "Modifier",
                type: 1,
                path: "fields.modifier",
                hideLabel: true
            },
            slBonus: {
                label: "DIALOG.SLBonus",
                type: 1,
                path: "fields.slBonus"
            },
            successBonus: {
                label: "DIALOG.SuccessBonus",
                type: 1,
                path: "fields.successBonus"
            },
            difficulty: {
                label: "Difficulty",
                type: 0,
                path: "fields.difficulty"
            },

        }
    }
    
    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/5e/base-dialog.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
            template : "systems/wfrp4e/templates/dialog/type/5e/default-dialog.hbs",
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    get title()
    {
        return this.context.title;
    }

    _getSubmissionData()
    {
        let data = super._getSubmissionData();

        data.chatOptions = this._setupChatOptions()
        data.chatOptions.rollMode = data.rollMode;

        return data
    }


    async computeFields() 
    {
        this.computeState()
        if (this.actor.attacker)
        {
            this._computeDefending(this.actor.attacker);
        }

        if (this.data.targets.length && !this.actor.attacker)
        {
            this._computeTargets(this.data.targets[0]);
        }
    }

    async computeState()
    {
        // minimum 0 because we don't want to count -1 advantage as having disadvantage
        this.fields.advantage = Math.max(0, this.fields.advantage);
        this.fields.disadvantage = Math.max(0, this.fields.disadvantage);

        
        if (this.userEntry.state)
        {
            this.fields.state = this.userEntry.state;
            return;
        }
    
        let diff = this.fields.advantage - this.fields.disadvantage;
        if (diff == 0)
        {
            this.fields.state = "normal";
        }
        else if (diff > 0)
        {
            this.fields.state = "adv";
            if (diff > 1)
            {
                this.fields.SL += diff - 1;
                this.tooltips.add("SL", diff - 1, game.i18n.localize("DIALOG.SurplusAdvantageTT"));
            }
        }
        else if (diff < 0)
        {
            this.fields.state = "dis";
            if (diff < -1)
            {
                this.fields.SL += diff + 1;
                this.tooltips.add("SL", diff + 1, game.i18n.localize("DIALOG.SurplusDisadvantageTT"));
            }
        }
    }

    /**
     * Runs when the actor is being attacked
     * @abstract
     */
    _computeDefending(attacker)
    {

    }

    /** 
     * Runs if targeting an actor
     * @abstract
     */
    _computeTargets(target)
    {

    }


    _defaultDifficulty()
    {
        let difficulty = "challenging"
        return difficulty;
    }

    _defaultFields() 
    {
        return foundry.utils.mergeObject({
            SL: 0,
            state : "normal",
            advantage : 0,
            disadvantage : 0,
            difficulty : this._defaultDifficulty(),

            // 4e
            modifier : 0,
            successBonus : 0,
            slBonus : 0,
        }, super._defaultFields());
    }

    createBreakdown()
    {
        let breakdown = {
            SL: this.fields.SL,
            modifier: this.fields.modifier,
            difficulty : this.fields.difficulty,
            slBonus : this.fields.slBonus,
            successBonus : this.fields.successBonus,
            modifiersBreakdown : this.tooltips.getCollectedTooltips()
        }
        return breakdown;
    }
    
 /**
   * Chat card options.
   *
   * All tests use the same chatOptions, but use the template member defined in each dialog class
   */
    _setupChatOptions() {
        let token = this.actor.token || this.actor.getActiveTokens()[0] || this.actor.prototypeToken;
        let chatOptions = {
            speaker: {
                alias: token.name,
                token: token.id,
                scene: token.parent?.id,
                actor: this.actor.id,
            },
            title: this.options.title,
            template: this.chatTemplate,
        }

        // If the test is coming from a token sheet
        if (this.actor.token) 
        {
            chatOptions.speaker.alias = this.actor.token.name; // Use the token name instead of the actor name
            chatOptions.speaker.token = this.actor.token.id;
            chatOptions.speaker.scene = canvas.scene.id

            if (this.actor.token.hidden) 
            {
                chatOptions.speaker.alias = "???"
            }
        }
        else // If a linked actor - use the currently selected token's data if the actor id matches
        {
            let speaker = ChatMessage.getSpeaker()
            if (speaker.actor == this.actor.id) 
            {
                let token = speaker.token ? canvas.tokens.get(speaker.token) : null;
                chatOptions.speaker.alias = speaker.alias
                chatOptions.speaker.token = speaker.token
                chatOptions.speaker.scene = speaker.scene
                if (token?.document.hidden) 
                {
                    chatOptions.speaker.alias = "???"
                }
            }
        }



        //Suppresses roll sound if the test has it's own sound associated
        foundry.utils.mergeObject(chatOptions,
        {
            user: game.user.id,
            sound: CONFIG.sounds.dice
        }, {overwrite : false})

        return chatOptions
    }

    /**
  * Creates the basic data that generally all dialogs use, such as formatting the speaker data and handling dialog scirpts
  * @param {Actor} actor Actor performing the test
  * @param {object} context Additional contextual flags for dialog, usually used by scripts
  * @returns {object} Basic dialog data shared by all types of dialogs
  */
    static _baseDialogData(actor, context, options) 
    {
        let dialogData = super._baseDialogData(actor, context, options)

        dialogData.data.other = []; // Container for miscellaneous data that can be freely added onto
        dialogData.data.speaker = CONFIG.ChatMessage.documentClass.getSpeaker({ actor });
        if (actor && !actor?.token) {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete dialogData.data.speaker.scene;
        }

        if (dialogData.context.result) {
            if (typeof dialogData.context.result.general === "string")
                dialogData.context.result.general = [dialogData.context.result.general]
            if (typeof dialogData.context.result.success === "string")
                dialogData.context.result.success = [dialogData.context.result.success]
            if (typeof dialogData.context.result.failure === "string")
                dialogData.context.result.failure = [dialogData.context.result.failure]
        }
        
        return dialogData;
    }

    static getDefendingScripts(actor)
    {
        // Defending scripts are dialog scripts coming from the attacker and/or the weapon used in the attack.
        // e.g. "Dodge tests to defend against this attack have disadvantage"
        let attacker = actor.attacker;
        return attacker?.test?.actor ? ((attacker.test.actor.getScripts("dialog").concat(attacker.test?.item?.getScripts?.("dialog") || [])).filter(s => s.options?.defending)) : []
    }


    static _onClickState(ev, target)
    {
        let type = target.dataset.type;
        if (type == "normal")
        {
            this.userEntry.state = this.userEntry.state ? "" : "normal";
        }
        else 
        {
            this.userEntry[type] = (this.userEntry[type] ?? 0) + (ev.button == 0 ? 1 : -1);
        }
        this.render({force: true});
    }


    // Backwards compatibility for effects
    get prefillModifiers() 
    {
        return this.fields;
    }

    get type() 
    {

    }
}