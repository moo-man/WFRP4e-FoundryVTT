import ItemDialog from "../apps/item-dialog";
import WFRP4eScript from "./script";

export default class EffectWfrp4e extends ActiveEffect
{

    constructor(data, context)
    {
        _migrateEffect(data, context);
        super(data, context);

    }


    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);

        // Take a copy of the test result that this effect comes from, if any
        // We can't use simply take a reference to the message id and retrieve the test as
        // creating a Test object before actors are ready (scripts can execute before that) throws errors
        this.updateSource({"flags.wfrp4e.sourceTest" : game.messages.get(options.message)?.getTest()});

        let preventCreation = false;
        preventCreation = await this._handleEffectPrevention(data, options, user);
        if (preventCreation)
        {
            ui.notifications.notify(game.i18n.format("EFFECT.EffectPrevented", {name : this.name}));
            return false; // If avoided is true, return false to stop creation
        }
        preventCreation = await this._handleFilter(data, options, user);
        if (preventCreation)
        {
            game.wfrp4e.utility.log(game.i18n.format("EFFECT.EffectFiltered", {name : this.name}), true, this);
            return false;
        }
        preventCreation = await this._handleConditionCreation(data, options, user);
        if (preventCreation)
        {
            return false;
        }
        await this._handleItemApplication(data, options, user);

        return await this.handleImmediateScripts(data, options, user);
    }

    async _onDelete(options, user)
    {
        await super._onDelete(options, user);
        await this.deleteCreatedItems();
        for(let script of this.scripts.filter(i => i.trigger == "deleteEffect"))
        {
            await script.execute({options, user});
        }
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);

        // If an owned effect is updated, run parent update scripts
        if (this.parent)
        {
            await Promise.all(this.parent.runScripts("updateDocument", {data, options, user}));
        }
    }

    async _onCreate(data, options, user)
    {
        await super._onCreate(data, options, user);

        // If an owned effect is created, run parent update scripts
        if (this.parent)
        {
            await Promise.all(this.parent.runScripts("updateDocument", {data, options, user}));
        }
    }

    //#region Creation Handling

    async handleImmediateScripts(data, options, user)
    {

        let scripts = this.scripts.filter(i => i.trigger == "immediate");
        if (scripts.length == 0)
        {
            return true;
        }

        let run = false;
        // Effect is direct parent, it's always applied to an actor, so run scripts
        if (this.parent?.documentName == "Actor")
        {
            run = true;
        }
        // If effect is grandchild, only run scripts if the effect should apply to the actor
        else if (this.parent?.documentName == "Item" && this.parent?.parent?.documentName == "Actor" && this.transfer)
        {
            run = true;
        }
        // If effect is child of Item, and Item is what it's applying to
        else if (this.parent?.documentName == "Item" && this.applicationData.documentType == "Item")
        {
            run = true;
        }

        if (run)
        {
            if (scripts.length)
            {
                await Promise.all(scripts.map(s => s.execute({data, options, user})));
                return !this.scripts.every(s => s.options?.immediate?.deleteEffect);
                // If all scripts agree to delete the effect, return false (to prevent creation);
            }
        }
    }

    async _handleEffectPrevention()
    {
        if (this.applicationData.avoidTest.prevention)
        {
            return this.resistEffect();
        }
    }
    
    /** 
     * This function handles creation of new conditions on an actor
     * If an Item adds a Condition, prevent that condition from being added, and instead call `addCondition` 
     * This prevents the Condition from being removed when the item is removed, but more importantly
     * `addCondition` handles Minor conditions turning into Major if a second Minor is added.
     */
    async _handleConditionCreation(data, options)
    {
        // options.condition tells us that it has already gone through addCondition, so this avoids a loop
        if (this.isCondition && !options.condition) 
        {
            // If adding a condition, prevent it and go through `addCondition`      // TODO handle these options
            this.parent?.addCondition(this.key, this.conditionValue, {origin: this.origin, flags : this.flags});
            return true;
        }
    }

    /**
     * There is a need to support applying effects TO items, but I don't like the idea of actually
     * adding the document to the item, as it would not work with duration handling modules and 
     * would need a workaround to show the icon on a Token. Instead, when an Item type Active Effect
     * is applied, keep it on the actor, but keep a reference to the item(s) being modified (if none, modify all)
     * 
     */
    async _handleItemApplication()
    {
        let applicationData = this.applicationData;
        if (applicationData.documentType == "Item" && this.parent?.documentName == "Actor")
        {
            let items = [];
            let filter = this.filterScript;

            // If this effect specifies a filter, narrow down the items according to it
            // TODO this filter only happens on creation, so it won't apply to items added later
            if (filter)
            {
                items = this.parent.items.contents.filter(i => filter.execute(i)); // Ids of items being affected. If empty, affect all
            }

            // If this effect specifies a prompt, create an item dialog prompt to select the items
            if (applicationData.prompt)
            {
                items = await ItemDialog.create(items, "unlimited");
            }


            this.updateSource({"flags.wfrp4e.itemTargets" : items.map(i => i.id)});
        }
    }

    async _handleFilter()
    {
        let applicationData = this.applicationData;
        let filter = this.filterScript;
        if (!filter)
        {
            return;
        }

        if (applicationData.documentType == "Item" && this.parent?.documentName == "Actor")
        {
            return; // See above, _handleItemApplication
        }


        if (this.parent)
        {
            return filter.execute(this.parent);
        }
    }


    async resistEffect()
    {
        let actor = this.actor;

        // If no owning actor, no test can be done
        if (!actor)
        {
            return false;
        }

        let applicationData = this.applicationData;

        // If no test, cannot be avoided
        if (applicationData.avoidTest.value == "none")
        {
            return false;
        }

        let test;
        let options = {appendTitle : " - " + this.name};
        if (applicationData.avoidTest.value == "script")
        {
            let script = new WFRP4eScript({label : this.effect + " Avoidance", string : applicationData.avoidTest.script}, WFRP4eScript.createContext(this));
            return await script.execute();
        }
        else if (applicationData.avoidTest.value == "custom")
        {
            options = {}
            if (applicationData.avoidTest.skill)
            {
                options.difficulty = applicationData.avoidTest.difficulty
                options.characteristic = applicationData.avoidTest.characteristic
                test = await this.actor.setupSkill(applicationData.avoidTest.skill, options)
            }
            else if (applicationData.avoidTest.characteristic)
            {
                options.difficulty = applicationData.avoidTest.difficulty
                test = await this.actor.setupCharacteristic(applicationData.avoidTest.characteristic, options)
            }
        }

        await test.roll();

        if (!applicationData.avoidTest.reversed)
        {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (applicationData.avoidTest.opposed && this.getFlag("wfrp4e", "sourceTest"))
            {
                return test.result.SL > this.getFlag("wfrp4e", "sourceTest").result?.SL;
            }
            else 
            {
                return test.succeeded;
            }
        }
        else  // Reversed - Failure removes the effect
        {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (applicationData.avoidTest.opposed && this.getFlag("wfrp4e", "sourceTest"))
            {
                return test.result.SL < this.getFlag("wfrp4e", "sourceTest").result?.SL;
            }
            else 
            {
                return !test.succeeded;
            }
        }
    }

    /**
     * Delete all items created by scripts in this effect
     */
    deleteCreatedItems()
    {
        if (this.actor)
        {
            let createdItems = this.actor.items.filter(i => i.getFlag("wfrp4e", "fromEffect"), this.id);
            if (createdItems.length)
            {
                ui.notifications.notify(game.i18n.format("EFFECT.DeletingEffectItems", {items : createdItems.map(i => i.name).join(", ")}));
                return this.actor.deleteEmbeddedDocuments("Item", createdItems.map(i => i.id));
            }
        }
    }

    //#endregion

    prepareData() 
    {
        super.prepareData();

        if (this.applicationData.enableConditionScript && this.actor)
        {
            this.conditionScript = new WFRP4eScript({string : this.applicationData.enableConditionScript, label : `Enable Script for ${this.name}`}, WFRP4eScript.createContext(this));
            this.disabled = !this.conditionScript.execute();
        }

        // Refresh scripts
        this._scripts = undefined;

        if (this.parent?.documentName == "Item")
        {
            this.transfer = this.determineTransfer();
        }
    }

    determineTransfer()
    {
        let application = this.applicationData;

        let allowed = (application.type == "document" && application.documentType == "Actor");

        if (this.parent.documentName == "Item")
        {
            allowed = allowed && this.item.system.shouldTransferEffect(this);
        }
        
        return allowed;
    }

    // To be applied, some data needs to be changed
    // Convert type to document, as applying should always affect the document being applied
    // Set the origin as the actor's uuid
    // convert name to status so it shows up on the token
    convertToApplied(test)
    {
        let effect = this.toObject();

        // An applied targeted aura should stay as an aura type, but it is no longer targeted
        if (effect.flags.wfrp4e.applicationData.type == "aura" && effect.flags.wfrp4e.applicationData.targetedAura)
        {
            effect.flags.wfrp4e.applicationData.targetedAura = false;
        }
        else 
        {
            effect.flags.wfrp4e.applicationData.type = "document";
        }
        effect.origin = this.actor?.uuid;
        effect.statuses = [this.key || effect.name.slugify()];
    
        let item = test?.item;

        let duration
        if (test && test.result.overcast && test.result.overcast.usage.duration) {
            duration = test.result.overcast.usage.duration.current;
        } else if(item?.Duration) {
            duration = parseInt(item.Duration);
        }
    
        if (duration) {
            if (item.duration.value.toLowerCase().includes(game.i18n.localize("Seconds")))
            effect.duration.seconds = duration;
    
            else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Minutes")))
            effect.duration.seconds = duration * 60
    
            else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Hours")))
            effect.duration.seconds = duration * 60 * 60
    
            else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Days")))
            effect.duration.seconds = duration * 60 * 60 * 24
    
            else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Rounds")))
            effect.duration.rounds = duration;
        }

        // When transferred to another actor, effects lose their reference to the item it was in
        // So if a effect pulls its avoid test from the item data, it can't, so place it manually
        // TODO: Don't think this is needed
        // if (this.applicationData.avoidTest.value == "item")
        // {
        //     effect.flags.wfrp4e.applicationData.avoidTest.value = "custom";
        //     mergeObject(effect.flags.wfrp4e.applicationData.avoidTest, this.item?.getTestData() || {});
        // }

        return effect;
    }

    get scripts()
    {  
        if (!this._scripts)
        {
            this._scripts = this.scriptData.map(i => new WFRP4eScript(i, WFRP4eScript.createContext(this)));
        }
        return this._scripts;
    }

    get manualScripts()
    {
        return this.scripts.filter(i => i.trigger == "manual");
    }

    get filterScript()
    {
        if (this.applicationData.filter)
        {
            try 
            {
                return new WFRP4eScript({script : this.applicationData.filter, label : `${this.name} Filter`}, WFRP4eScript.createContext(this));
            }
            catch(e)
            {
                console.error("Error creating filter script: " + e);
                return null;
            }
        }
        else { return null; }
    }

    get item()
    {
        if (this.parent?.documentName == "Item")
        {
            return this.parent;
        }
        else
        {
            return undefined;
        }
    }

    get originDocument() 
    {
        return fromUuidSync(this.origin);
    }

    get actor()
    {
        if (this.parent?.documentName == "Item")
        {
            return this.parent.parent;
        }
        else if (this.parent?.documentName == "Actor")
        {
            return this.parent;
        }
        else 
        {
            return undefined;
        }
    }

    get source()
    {
        if (this.parent?.documentName == "Item")
        {
            return this.parent.name;
        }
        else
        {
            return super.sourceName; // TODO Handle diseases like v1 sourceName getter?
        }
    }

    get scriptData() 
    {
        return this.flags?.wfrp4e?.scriptData || [];

        /**
         * label
         * string
         * trigger
         */
    }

    get key () 
    {
        return Array.from(this.statuses)[0];
    }

    get show() {
        if (game.user.isGM || !this.getFlag("wfrp4e", "hide"))
          return true
        else 
          return false
      }

    get displayLabel() {
        if (this.count > 1)
            return this.name + ` (${this.count})`
        else return this.name
    }

    // TODO: this should be used more in scripts, search for replacements
    get specifier() {
        return this.name.substring(this.name.indexOf("(") + 1, this.name.indexOf(")"))
    }

    get isCondition() 
    {
        return !!game.wfrp4e.config.conditions[this.key];
    }

    get conditionId(){
        return this.key
    }

    get isNumberedCondition() {
        return Number.isNumeric(this.conditionValue)
    }

    get conditionValue() 
    {
        return this.getFlag("wfrp4e", "value");
    }

    // Computed effects mean flagged to know that they came from a calculation, notably encumbrance causing overburdened or restrained
    get isComputed()
    {
        return this.getFlag("wfrp4e", "computed");
    }

    get sourceTest() 
    {
        return this.getFlag("wfrp4e", "sourceTest");
    }

    get sourceActor() 
    {
        return ChatMessage.getSpeakerActor(this.sourceTest.context.speaker);
    }

    async computeAuraRadius()
    {
        return (await new Roll(this.applicationData.radius, {effect : this, actor : this.actor, item : this.item}).roll()).total;
    }

    get applicationData() 
    {
        let applicationData = mergeObject(this.constructor._defaultApplicationData(), this.getFlag("wfrp4e", "applicationData"));

        // // Delete non-relevant properties based on application type
        // if (applicationData.type == "document")
        // {
        //     delete applicationData.avoidTest;
        //     delete applicationData.filters;
        //     delete applicationData.prompt;
        //     delete applicationData.consume;
        // }

        // if (applicationData.type == "damage")
        // {
        //     delete applicationData.avoidTest;

        //     if (applicationData.documentType == "Actor")
        //     {
        //         delete applicationData.filters;
        //         delete applicationData.prompt;
        //     }

        //     delete applicationData.consume;
        // }

        return applicationData;
    }

    static getCreateData(effectData, overlay=false)
    {
        const createData = foundry.utils.deepClone(effectData);
        if ( overlay ) 
        {
            createData.flags = {core : {overlay : true}};
        }
        if (!createData.duration)
        {
            createData.duration = {};
        }
        delete createData.id;
        return createData;
    }



    // I feel like "application" should be renamed to "transfer"
    static _defaultApplicationData() 
    {
        return {
            type : "document",
            documentType : "Actor",

            // Test Properties
            avoidTest : { 
                value : "none",
                opposed : false,
                prevention : true,
                reversed : false,
                manual : false,
                script : "",
                difficulty : "",
                characteristic : "",
                skill : ""
            },

            // Other

            keep : false, // Area/Aura - should they keep the effect when leaving
            radius : null, // Area/Aura radius, if null, inherit from item

            areaType : "instantaneous", // Area - "instantaneous" or "sustained"

            targetedAura : false, // Aura - if the aura should be applied to a target and not self


            equipTransfer : true,
            enableConditionScript : "",
            filter : "",
            prompt : false,
        };
    }

    static _defaultDialogOptions() 
    {
        return {
            targeter : false,
            hideScript : "",
            activateScript : "",
            submissionScript : ""
        };
    }

    static _defaultImmediateOptions() 
    {
        return {
            deleteEffect : false
        };
    }

    static _triggerMigrations(trigger)
    {
        let migrations = {
            "invoke" : "manual",
            "oneTime" : "immediate",
            "addItems" : "immediate",
            "dialogChoice" : "dialogChoice",
            "prefillDialog" : "dialog",
            "targetPrefillDialog" : "dialog"
        }
        return migrations[trigger] || trigger;
    }
}


function _migrateEffect(data, context)
{
    let flags = getProperty(data, "flags.wfrp4e");

    if (!flags || flags._legacyData || flags.scriptData)
    {
        return;
    }


    flags.applicationData = {};
    flags.scriptData = []
    let newScript = {
        label : data.name,
        trigger : _triggerMigrations(flags.effectTrigger),
    }

    if (flags.effectTrigger == "targetPrefillDialog")
    {
        setProperty(newScript, "options.dialog.targeter", true);
    }

    if (flags.script)
    {
        // Previously scripts could reference the source test with a janky {{path}} statement
        // Now, all scripts have a `this.effect` reference, which has a `sourceTest` getter
        let script = flags.script
        let regex = /{{(.+?)}}/g
        let matches = [...script.matchAll(regex)]
        matches.forEach(match => {
            script = script.replace(match[0], `this.effect.sourceTest.data.result.${match[1]}`)
        })
        newScript.script = script;

        
        if (flags.effectTrigger == "prefillDialog")
        {
            // Old prefill triggers always ran for every dialog with conditional logic inside to add modifiers or not
            // To reflect that, migrated prefill tiggers need to always be active in the dialog
            setProperty(newScript, "options.dialog.activateScript", "return true")
        }

    }
    else if (flags.effectTrigger == "dialogChoice")
    {
        newScript.label = flags.effectData.description || newScript.label
        newScript = `
        args.prefillModifiers.modifier += ${flags.effectData.modifier || 0};
        args.prefillModifiers.slBonus += ${flags.effectData.SLBonus || 0};
        args.prefillModifiers.successBonus += ${flags.effectData.successBonus || 0};
        `;
        // Missing difficultyBonus?
    }
    flags.scriptData.push(newScript)

    switch(flags.effectApplication)
    {
        case "actor":
            flags.applicationData.type = "document";                
            flags.applicationData.documentType = "Actor";                
            flags.applicationData.equipTransfer = false;
            break;
        case "item":
            flags.applicationData.type = "document";                
            flags.applicationData.documentType = "Item";                
            break;
        case "equipped":
            flags.applicationData.type = "document";                
            flags.applicationData.documentType = "Actor";  
            flags.applicationData.equipTransfer = true;
            break;
        case "apply" : 
            flags.applicationData.type = "target";                
            break;
        case "damage" : 
            flags.applicationData.type = "document"; // Not sure about this
            flags.applicationData.documentType = "Item";
            break;
    }

    if (flags.itemChoice)
    {
        flags.applicationData.filter = flags.itemChoice;
    }
    if (flags.promptChoice)
    {
        flags.applicationData.prompt = true;
    }

    
    flags._legacyData = {
        effectApplication : flags.effectApplication,
        effectTrigger : flags.effectTrigger,
        preventDuplicateEffects : flags.preventDuplicateEffects,
        script : flags.script
    }
    delete flags.effectApplication;
    delete flags.effectTrigger;
    delete flags.preventDuplicateEffects;
    delete flags.script;
}

function _triggerMigrations(trigger)
{
    let migrations = {
        "invoke" : "manual",
        "oneTime" : "immediate",
        "addItems" : "immediate",
        "dialogChoice" : "dialog",
        "prefillDialog" : "dialog",
        "targetPrefillDialog" : "dialog"
    }
    return migrations[trigger] || trigger;
}