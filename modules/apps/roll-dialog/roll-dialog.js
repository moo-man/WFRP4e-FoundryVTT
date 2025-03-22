export default class RollDialog extends WarhammerRollDialog {

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

    testClass = null;

    get template() 
    {
      return "systems/wfrp4e/templates/dialog/base-dialog.hbs";
    }


    /**
     * @override
     * Overide submit to handle creating the test with testClass
     * 
     * @param {Event|null} ev Triggering Event
     * @returns 
     */
    submit(ev) 
    {
        ev?.preventDefault();
        ev?.stopPropagation();
        
        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                script.submission(this);
            }
        }

        let test = new this.testClass(this._getSubmissionData(), this.actor)
        
        if (this.resolve)
        {
            this.resolve(test);
        }
        this.close();
        if (canvas.scene && !this.options.skipTargets)
        {
            game.user.updateTokenTargets([]);
            game.user.broadcastActivity({targets: []});
        }
        return test;
    }

    async bypass()
    {
        let data = await super.bypass();
        
        let test = new this.testClass(data, this.actor)
        if (this.resolve)
        {
            this.resolve(test);
        }
    }

    _getSubmissionData()
    {
        if (!this.testClass)
        {
            throw new Error("Only subclasses of RollDialog can be submitted")
        }
        this.data.context = {};
        let data = super._getSubmissionData();
        data.breakdown = data.context.breakdown;
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
            if (!game.settings.get("wfrp4e", "mooAdvantage"))
            {
                this.fields.modifier += (game.settings.get("wfrp4e", "advantageBonus") * this.actor.system.status.advantage.value)
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

    activateListeners(html) {
        super.activateListeners(html);
        html.find("[name='advantage']").change(this._onAdvantageChanged.bind(this));
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
        return mergeObject({
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
        let chatOptions = {
            speaker: {
                alias: this.actor.token?.name || this.actor.prototypeToken.name,
                actor: this.actor.id,
            },
            title: this.options.title,
            template: this.chatTemplate,
            flags: { img: this.actor.prototypeToken.randomImg ? this.img : this.actor.prototypeToken.texture.src }
            // img to be displayed next to the name on the test card - if it's a wildcard img, use the actor image
        }

        // If the test is coming from a token sheet
        if (this.actor.token) {
        chatOptions.speaker.alias = this.actor.token.name; // Use the token name instead of the actor name
        chatOptions.speaker.token = this.actor.token.id;
        chatOptions.speaker.scene = canvas.scene.id
        chatOptions.flags.img = this.actor.token.texture.src; // Use the token image instead of the actor image

        if (this.actor.token.hidden) {
            chatOptions.speaker.alias = "???"
            chatOptions.flags.img = "systems/wfrp4e/tokens/unknown.png"
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
            chatOptions.flags.img = token ? token.document.texture.src : chatOptions.flags.img
            if (token?.document.hidden) {
            chatOptions.speaker.alias = "???"
            chatOptions.flags.img = "systems/wfrp4e/tokens/unknown.png"
            }
        }
        }

        if (this.isMounted && this.mount) {
            chatOptions.flags.mountedImg = this.mount.prototypeToken.texture.src;
            chatOptions.flags.mountedName = this.mount.prototypeToken.name;
        }

        if (VideoHelper.hasVideoExtension(chatOptions.flags.img))
        game.video.createThumbnail(chatOptions.flags.img, { width: 50, height: 50 }).then(img => chatOptions.flags.img = img)

        //Suppresses roll sound if the test has it's own sound associated
        foundry.utils.mergeObject(chatOptions,
        {
            user: game.user.id,
            sound: CONFIG.sounds.dice
        }, {overwrite : false})

        return chatOptions
    }

    static getDefendingScripts(actor)
    {
        // Defending scripts are dialog scripts coming from the attacker and/or the weapon used in the attack.
        // e.g. "Dodge tests to defend against this attack have disadvantage"
        let attacker = actor.attacker;
        return attacker ? ((attacker.test.item?.getScripts("dialog").concat(attacker.test?.actor?.getScripts("dialog"))).filter(s => s.options?.defending)) : []
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