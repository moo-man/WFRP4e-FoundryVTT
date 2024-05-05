import WFRP_Utility from "../../system/utility-wfrp4e";
import { DialogTooltips } from "./tooltips";

export default class RollDialog extends Application {


    subTemplate = "";
    chatTemplate = ""
    selectedScripts = [];
    unselectedScripts = [];
    testClass = null;
    #onKeyPress;


    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.classes = options.classes.concat(["wfrp4e", "wfrp4e-dialog"]);
        return options;
    }
 
    get actor() 
    {
        return this.data.actor;
    }

    get template() 
    {
      return "systems/wfrp4e/templates/dialog/base-dialog.hbs";
    }

    constructor(fields, data, resolve, options)
    {
        super(options);
        this.data = data;
        this.tooltips = new DialogTooltips();

        this.initialFields = mergeObject(this._defaultFields(), fields);
        this.fields = this._defaultFields();
        this.userEntry = {};

        // If an effect deems this dialog cannot be rolled, it can switch this property to true and the dialog will close
        this.abort = false;

        // The flags object is for scripts to use freely, but it's mostly intended for preventing duplicate effects
        // A specific object is needed as it must be cleared every render when scripts run again
        this.flags = {};

        this.data.scripts = this._consolidateScripts(data.scripts);

        if (resolve)
        {
            this.resolve = resolve;
        }
    }

    /**
     * @abstract
     */
    static async setup(fields={}, data={}, options={})
    {
        throw new Error("Only subclasses of RollDialog can be setup")
    }

    async _render(...args)
    {
        await super._render(args)
        
        if (this.abort)
        {
            this.close();
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        this.form = html[0];
        this.form.onsubmit = this.submit.bind(this);

        // Listen on all elements with 'name' property
        html.find(Object.keys(new FormDataExtended(this.form).object).map(i => `[name='${i}']`).join(",")).change(this._onInputChanged.bind(this));

        html.find(".dialog-modifiers .modifier").click(this._onModifierClicked.bind(this));

        html.find("[name='advantage']").change(this._onAdvantageChanged.bind(this));
        
        // Don't add another listener if one already exists
        if (!this.#onKeyPress)
        {
            // Need to remember binded function to later remove
            this.#onKeyPress = this._onKeyPress.bind(this);
            document.addEventListener("keypress", this.#onKeyPress);
        }

    }

    submit(ev) 
    {
        ev.preventDefault();
        ev.stopPropagation();
        
        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                script.submission(this);
            }
        }

        let test = new this.testClass(this._constructTestData(), this.actor)
        
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
        await this.getData();
        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                script.submission(this);
            }
        }

        let test = new this.testClass(this._constructTestData(), this.actor)
        if (this.resolve)
        {
            this.resolve(test);
        }
    }

    _constructTestData()
    {
        if (!this.testClass)
        {
            throw new Error("Only subclasses of RollDialog can be submitted")
        }
        let data = mergeObject(this.data, this.fields);
        data.options = this.options
        data.breakdown = this.createBreakdown();
        if (!this.options.skipTargets)
        {
            data.targets = Array.from(data.targets).map(t => t.actor.speakerData(t.document))
        }
        data.chatOptions = this._setupChatOptions()
        data.chatOptions.rollMode = data.rollMode;
        return data
    }

    close() 
    {
        super.close();
        document.removeEventListener("keypress", this.#onKeyPress);
    }

    async getData() 
    {
        // Reset values so they don't accumulate 
        this.tooltips.clear();
        this.flags = {};
        this.fields = this._defaultFields();

        this.tooltips.start(this);
        mergeObject(this.fields, this.initialFields);
        this.tooltips.finish(this, this.options.initialTooltip || "Initial")

        this.tooltips.start(this);
        for(let key in this.userEntry)
        {
            if (["string", "boolean"].includes(typeof this.userEntry[key]))
            {
                this.fields[key] = this.userEntry[key]
            }
            else if (Number.isNumeric(this.userEntry[key]))
            {
                this.fields[key] += this.userEntry[key];
            }
        }
        this.tooltips.finish(this, "User Entry")

        // For some reason cloning the scripts doesn't prevent isActive and isHidden from persisisting
        // So for now, just reset them manually
        this.data.scripts.forEach(script => 
        {
            script.isHidden = false;
            script.isActive = false;
        });
        
        this._hideScripts();
        this._activateScripts();
        await this.computeScripts();
        await this.computeFields();

        return {
            data : this.data,
            fields : this.fields,
            tooltips : this.tooltips,
            subTemplate : await this.getSubTemplate()
        };
    }

    /**
     * This is mostly for talents, where an actor likely has multiple
     * of the same talent. We don't want to show the same dialog effect
     * multiple times, so instead count the number of scripts that are the 
     * same. When executed, execute it the number of times there are scripts
     * 
     */
    _consolidateScripts(scripts)
    {
        let consolidated = []

        for(let script of scripts)
        {
            let existing = consolidated.find(s => isSameScript(script, s))
            if (!existing)
            {
                script.scriptCount = 1;
                consolidated.push(script);
            }
            else 
            {
                existing.scriptCount++;
            }
        }

        function isSameScript(a, b)
        {
            return (a.Label == b.Label) &&
             (a.script == b.script) && 
             (a.options?.dialog?.hideScript == b.options?.dialog?.hideScript) && 
             (a.options?.dialog?.activateScript == b.options?.dialog?.activateScript) &&
             (a.options?.dialog?.submissionScript == b.options?.dialog?.submissionScript)
        }
        return consolidated
    }

    _hideScripts()
    {
        this.data.scripts.forEach((script, index) => 
        {
            // If user selected script, make sure it is not hidden, otherwise, run its script to determine
            if (this.selectedScripts.includes(index))
            {
                script.isHidden = false;
            }
            else
            {
                script.isHidden = script.hidden(this);
            }
        });
    }

    _activateScripts()
    {
        this.data.scripts.forEach((script, index) => 
        {
            // If user selected script, activate it, otherwise, run its script to determine
            if (this.selectedScripts.includes(index))
            {
                script.isActive = true;
            }
            else if (this.unselectedScripts.includes(index))
            {
                script.isActive = false;
            }
            else if (!script.isHidden) // Don't run hidden script's activation test
            {
                script.isActive = script.activated(this);
            }
        });
    }

    async computeScripts() 
    {
        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                this.tooltips.start(this);
                for(let i = 0; i < script.scriptCount; i++)
                {
                    await script.execute(this);
                }
                this.tooltips.finish(this, script.Label);
            }
        }
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

    
    /**
     * Allows subclasses to insert custom fields
     */
     async getSubTemplate()
     {
         if (this.subTemplate)
         {
             return await renderTemplate(this.subTemplate, {fields : this.fields, data: this.data, options : this.options});
         }
     }


    _onInputChanged(ev) 
    {
        let value = ev.currentTarget.value;
        if (ev.currentTarget.name == "advantage")
        {
            return;
        }
        if (Number.isNumeric(value))
        {
            value = Number(value);
        }

        if (ev.currentTarget.type == "checkbox")
        {
            value = ev.currentTarget.checked;
        }

        this.userEntry[ev.currentTarget.name] = value;

        this.render(true);
    }

    _onModifierClicked(ev)
    {
        let index = Number(ev.currentTarget.dataset.index);
        if (!ev.currentTarget.classList.contains("active"))
        {
            // If modifier was unselected by the user (originally activated via its script)
            // it can be assumed that the script will still be activated by its script
            if (this.unselectedScripts.includes(index))
            {
                this.unselectedScripts = this.unselectedScripts.filter(i => i != index);
            }
            else 
            {
                this.selectedScripts.push(index);
            }
        }
        else 
        {
            // If this modifier was NOT selected by the user, it was activated via its script
            // must be added to unselectedScripts instead
            if (!this.selectedScripts.includes(index))
            {
                this.unselectedScripts.push(index);
            }
            else // If unselecting manually selected modifier
            {
                this.selectedScripts = this.selectedScripts.filter(i => i != index);
            }
        }
        this.render(true);
    }

    _onAdvantageChanged(ev)
    {
        this.actor.update({"system.status.advantage.value" : Number(ev.currentTarget.value)}).then(a => this.render(true))
        ui.notifications.notify(game.i18n.localize("DIALOG.AdvantageUpdate"))
    }

    /**
     * 
     * @param {object} data Dialog data, such as title and actor
     * @param {object} data.title.replace Custom dialog/test title
     * @param {object} data.title.append Append something to the test title
     * @param {object} fields Predefine dialog fields
     */
    static awaitSubmit({data={}, fields={}}={})
    {
        return new Promise(resolve => 
        {
            new this(data, fields, resolve).render(true);
        });
    }

    _onKeyPress(ev)
    {
        if (ev.key == "Enter")
        {
            this.submit(ev); 
        }
    }
    
    updateTargets()
    {
        this.data.targets = Array.from(game.user.targets);
        this.render(true);
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
        return {
            modifier : 0,
            successBonus : 0,
            slBonus : 0,
            difficulty : this._defaultDifficulty(),
            rollMode : game.settings.get("core", "rollMode") || "publicroll"
        };
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

    
    static updateActiveDialogTargets() 
    {
        Object.values(ui.windows).forEach(i => 
        {
            if (i instanceof TestDialog)
            {
                i.updateTargets();
            }
        });
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
        mergeObject(chatOptions,
        {
            user: game.user.id,
            sound: CONFIG.sounds.dice
        }, {overwrite : false})

        return chatOptions
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