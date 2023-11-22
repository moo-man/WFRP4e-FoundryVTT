import WFRP_Utility from "../../system/utility-wfrp4e";
import { DialogTooltips } from "./tooltips";

export default class RollDialog extends Application {


    subTemplate = "";
    selectedScripts = [];
    unselectedScripts = [];
    #onKeyPress;


    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.classes = options.classes.concat(["wfrp4e", "wfrp4e-dialog"]);
        return options;
    }
 
    get actor() 
    {
        // TODO
    }

    get template() 
    {
      return "systems/wfrp4e/templates/dialog/base-dialog.hbs";
    }

    constructor(fields, data, resolve, options)
    {
        super(options);
        this.data = data;
        this.fields = mergeObject(this._defaultFields(),fields);
        this.userEntry = foundry.utils.deepClone(this.fields);
        this.tooltips = new DialogTooltips();

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

    activateListeners(html) {
        super.activateListeners(html);

        this.form = html[0];
        this.form.onsubmit = this.submit.bind(this);

        // Listen on all elements with 'name' property
        html.find(Object.keys(new FormDataExtended(this.form).object).map(i => `[name='${i}']`).join(",")).change(this._onInputChanged.bind(this));


        html.find(".dialog-modifiers .modifier").click(this._onModifierClicked.bind(this));
        
        // Need to remember binded function to later remove
        this.#onKeyPress = this._onKeyPress.bind(this);
        document.addEventListener("keypress", this.#onKeyPress);

    }

    submit(ev) 
    {
        ev.preventDefault();
        ev.stopPropagation();
        let dialogData = mergeObject(this.data, this.fields);

        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                script.submission(this);
            }
        }

        if (this.resolve)
        {
            this.resolve(dialogData);
        }
        this.close();
        return dialogData;
    }

    close() 
    {
        super.close();
        document.removeEventListener("keypress", this.#onKeyPress);
    }

    async getData() 
    {
        this.tooltips.clear();

        // Reset values so they don't accumulate 
        mergeObject(this.fields, this.userEntry);

        // calling tooltips.start/finish between the merge object caused issues
        this.tooltips.addModifier(this.userEntry.modifier, "User Entry");
        this.tooltips.addSLBonus(this.userEntry.slBonus, "User Entry");
        this.tooltips.addSuccessBonus(this.userEntry.successBonus, "User Entry");

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
            scripts : this.data.scripts,
            fields : this.fields,
            tooltips : this.tooltips,
            subTemplate : await this.getSubTemplate()
        };
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
                await script.execute(this);
                this.tooltips.finish(this, script.label);
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
                this.fields.modifier += (game.settings.get("wfrp4e", "advantageBonus") * this.fields.advantage)
            }
            else 
            {
                this.fields.successBonus += this.fields.advantage;
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
            advantage : 0,
            modifier : 0,
            successBonus : 0,
            slBonus : 0,
            difficulty : this._defaultDifficulty(),
            rollmode : game.settings.get("core", "rollMode") || "publicroll"
        };
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


    // Backwards compatibility for effects
    get prefillModifiers() 
    {
        return this.fields;
    }

    get type() 
    {

    }
}





















    //     // this.advantage = Number(html.find('[name="advantage"]').change(ev => {
    //     //     let advantage = parseInt(ev.target.value)
    //     //     if (Number.isNumeric(advantage)) {
    //     //         this.changeAdvantage(advantage)
    //     //         this.updateValues(html)
    //     //     }
    //     // }).val());

    //     html.find('[name="charging"]').change(ev => {

    //         let onlyModifier = game.settings.get("wfrp4e","useGroupAdvantage");
    //         if (ev.target.checked)
    //         {
    //             // If advantage cap, only add modifier if at cap
    //             if (!onlyModifier && game.settings.get("wfrp4e", "capAdvantageIB"))
    //             {
    //                 onlyModifier = (this.advantage >= this.data.actor.characteristics.i.bonus)
    //             }

    //             onlyModifier ? this.userEntry.testModifier += (+10) : this.changeAdvantage((this.advantage || 0) + 1)
    //         }
    //         else
    //         {
    //             onlyModifier ?  this.userEntry.testModifier += (-10) : this.changeAdvantage((this.advantage || 0) - 1)
    //         }

    //         html.find('[name="advantage"]')[0].value = this.advantage
    //         this.updateValues(html)
    //     })


    //     this.userEntry.successBonus = Number(html.find('[name="successBonus"]').change(ev => {
    //         this.userEntry.successBonus = Number(ev.target.value)
    //         if (game.settings.get("wfrp4e", "mooAdvantage"))
    //             this.userEntry.successBonus -= (this.advantage || 0)
    //         this.updateValues(html)
    //     }).val())
    //     this.userEntry.slBonus = Number(html.find('[name="slBonus"]').change(ev => {
    //         this.userEntry.slBonus = Number(ev.target.value)
    //         this.updateValues(html)
    //     }).val())
    //     this.userEntry.difficulty = html.find('[name="testDifficulty"]').change(ev => {
    //         this.userEntry.difficulty = ev.target.value
    //         this.updateValues(html)
    //     }).val()

    //     this.userEntry.calledShot = 0;
    //     this.selectedHitLocation = html.find('[name="selectedHitLocation"]').change(ev => {
    //             // Called Shot - If targeting a specific hit location
    //             if (ev.currentTarget.value && !["none", "roll"].includes(ev.currentTarget.value))
    //             {
    //                 // If no talents prevent the penalty from being applied
    //                 if (!this.data.testData.deadeyeShot && !(this.data.testData.strikeToStun && this.selectedHitLocation.value == "head")) // Deadeye shot and strike to stun not applied
    //                     this.userEntry.calledShot = -20;
    //                 else 
    //                     this.userEntry.calledShot = 0;
    //             }
    //             else {
    //                 this.userEntry.calledShot = 0;
    //             }
    //         this.updateValues(html);
    //     })[0]


    //     if (!game.settings.get("wfrp4e", "mooAdvantage") && game.settings.get("wfrp4e", "autoFillAdvantage"))
    //         this.userEntry.testModifier -= (game.settings.get("wfrp4e", "advantageBonus") * this.advantage || 0)
    //     else if (game.settings.get("wfrp4e", "mooAdvantage"))
    //         this.userEntry.successBonus -= (this.advantage || 0)







    
    
    

    // updateValues(html) {


    //     let modifier = html.find('[name="testModifier"]')[0]
    //     let successBonus = html.find('[name="successBonus"]')[0]

    //     modifier.value = 
    //     (this.userEntry.testModifier || 0) + 
    //     (this.cumulativeBonuses.testModifier || 0) + 
    //     (this.userEntry.calledShot || 0)


    //     if (!game.settings.get("wfrp4e", "mooAdvantage") && game.settings.get("wfrp4e", "autoFillAdvantage"))
    //         modifier.value = Number(modifier.value) + (game.settings.get("wfrp4e", "advantageBonus") * this.advantage || 0) || 0

    //     successBonus.value = (this.userEntry.successBonus || 0) + (this.cumulativeBonuses.successBonus || 0)
    //     //@HOUSE
    //     if (game.settings.get("wfrp4e", "mooAdvantage"))
    //     {
    //         successBonus.value =  Number(successBonus.value) + Number(this.advantage || 0)
    //         WFRP_Utility.logHomebrew("mooAdvantage")
    //     }
    //     //@/HOUSE

    //     html.find('[name="slBonus"]')[0].value = (this.userEntry.slBonus || 0) + (this.cumulativeBonuses.slBonus || 0)


    //     let difficultySelect = html.find('[name="testDifficulty"]')
    //     difficultySelect.val(game.wfrp4e.utility.alterDifficulty(this.userEntry.difficulty, this.cumulativeBonuses.difficultyStep || 0))
    // }


    // changeAdvantage(advantage) {
    //     this.data.actor.update({ "system.status.advantage.value": advantage })
    //     ui.notifications.notify(game.i18n.localize("DIALOG.AdvantageUpdate"))
    //     this.advantage = advantage
    // }