export default class RollDialog extends WarhammerRollDialogV2 {

    static DEFAULT_OPTIONS = {
        position: {
            width: 600
        }
    };

    get tooltipConfig() 
    {
        return {
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
            }
        }
    }
    
    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/base-dialog.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
            template : "systems/wfrp4e/templates/dialog/type/default-dialog.hbs",
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };


    // /**
    //  * @override
    //  * Overide submit to handle creating the test with testClass
    //  * 
    //  * @param {Event|null} ev Triggering Event
    //  * @returns 
    //  */
    // static submit(ev) 
    // {
    //     ev?.preventDefault();
    //     ev?.stopPropagation();
        
    //     for(let script of this.data.scripts)
    //     {
    //         if (script.isActive)
    //         {
    //             script.submission(this);
    //         }
    //     }

    //     let test = new this.testClass(this._getSubmissionData(), this.actor)
        
    //     if (this.resolve)
    //     {
    //         this.resolve(test);
    //     }
    //     this.close();
    //     if (canvas.scene && !this.options.skipTargets)
    //     {
    //         game.canvas.tokens.setTargets([])
    //     }
    //     return test;
    // }

    // async bypass()
    // {
    //     let data = await super.bypass();
        
    //     let test = new this.testClass(data, this.actor)
    //     if (this.resolve)
    //     {
    //         this.resolve(test);
    //     }
    // }

    get title()
    {
        return this.context.title;
    }

    _getSubmissionData()
    {
        // if (!this.testClass)
        // {
        //     throw new Error("Only subclasses of RollDialog can be submitted")
        // }
        let data = super._getSubmissionData();

        data.chatOptions = this._setupChatOptions()
        data.chatOptions.rollMode = data.rollMode;

        return data
    }


    async computeFields() 
    {
        this._computeAdvantage();
        if (this.actor.attacker)
        {
            this._computeDefending(this.actor.attacker);
        }

        if (this.data.targets.length && !this.actor.attacker)
        {
            this._computeTargets(this.data.targets[0]);
        }
    }

    _computeAdvantage()
    {
        if (game.settings.get("wfrp4e", "autoFillAdvantage"))
        {
            this.tooltips.start(this);
            if (!game.settings.get("wfrp4e", "homebrew").mooAdvantage)
            {
                this.fields.modifier += (game.settings.get("wfrp4e", "homebrew").advantageBonus * this.actor.system.status.advantage.value)
            }
            else 
            {
                this.fields.successBonus += this.actor.system.status.advantage.value;
            }
            this.tooltips.finish(this, "Advantage");
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

    async _onRender(options) 
    {
        await super._onRender(options);

        this.element.querySelector("[name='advantage']").addEventListener("change", this._onAdvantageChanged.bind(this))
    }

    _onFieldChange(ev) 
    {
        if (ev.currentTarget.name == "advantage")
        {
            return;
        }
        else return super._onFieldChange(ev);
    }


    _onAdvantageChanged(ev)
    {
        this.actor.update({"system.status.advantage.value" : Number(ev.currentTarget.value)}).then(a => this.render(true))
        ui.notifications.notify(game.i18n.localize("DIALOG.AdvantageUpdate"))
    }


    _defaultDifficulty()
    {
        let difficulty = "challenging"

        // Overrides default difficulty to Average depending on module setting and combat state
        if (game.settings.get("wfrp4e", "testDefaultDifficulty") && (game.combat != null))
            difficulty = game.combat.started ? "challenging" : "average";
        else if (game.settings.get("wfrp4e", "testDefaultDifficulty"))
            difficulty = "average";

        return difficulty;
    }
    _defaultFields() 
    {
        return foundry.utils.mergeObject({
            modifier : 0,
            successBonus : 0,
            slBonus : 0,
            difficulty : this._defaultDifficulty(),
        }, super._defaultFields());
    }

    createBreakdown()
    {
        let breakdown = {
            modifier: this.fields.modifier,
            difficulty : this.fields.difficulty,
            slBonus : this.fields.slBonus,
            successBonus : this.fields.successBonus,
            modifiersBreakdown : this.tooltips.getCollectedTooltips()
        }
        return breakdown;
    }
    
 /**
   * Ghat card options.
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


    // Backwards compatibility for effects
    get prefillModifiers() 
    {
        return this.fields;
    }

    get type() 
    {

    }
}