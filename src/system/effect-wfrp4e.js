import TestWFRP from "./rolls/test-wfrp4e";

export default class ActiveEffectWFRP4e extends WarhammerActiveEffect
{

    constructor(data, context)
    {
        _migrateEffect(data, context);
        super(data, context);
    }
    
    async resistEffect()
    {
        let result = await super.resistEffect();
        if (result === false || result === true)
        {
            return result;
        }

        let test;
        let avoidTest = this.system.transferData.avoidTest
        if (avoidTest.value == "custom")
        {
            let options = {
                appendTitle : " - " + this.name,
                skipTargets: true
            }
            if (avoidTest.skill)
            {
                options.fields = {difficulty : avoidTest.difficulty}
                options.characteristic = avoidTest.characteristic
                test = await this.actor.setupSkill(avoidTest.skill, options)
            }
            else if (avoidTest.characteristic)
            {
                options.fields = {difficulty : avoidTest.difficulty}
                test = await this.actor.setupCharacteristic(avoidTest.characteristic, options)
            }

            await test.roll();

            if (!avoidTest.reversed)
            {
                // If the avoid test is marked as opposed, it has to win, not just succeed
                if (avoidTest.opposed && this.sourceTest)
                {
                    return parseInt(test.result.SL) > parseInt(this.sourceTest.result?.SL);
                }
                else 
                {
                    return test.succeeded;
                }
            }
            else  // Reversed - Failure removes the effect
            {
                // If the avoid test is marked as opposed, it has to win, not just succeed
                if (avoidTest.opposed && this.sourceTest)
                {
                    return parseInt(test.result.SL) < parseInt(this.sourceTest.result?.SL);
                }
                else 
                {
                    return !test.succeeded;
                }
            }
        }
    }


    // To be applied, some data needs to be changed
    // Convert type to document, as applying should always affect the document being applied
    // Set the origin as the actor's uuid
    // convert name to status so it shows up on the token
    convertToApplied(test)
    {
        let effect = super.convertToApplied(test);

        // An applied targeted aura should stay as an aura type, but it is no longer targeted
        if (effect.system.transferData.type == "aura" && test)
        {
            effect.system.transferData.area.radius = effect.system.transferData.area.radius || test.result.overcast.usage.target.current?.toString();
        }

        if (this.item?.type == "spell")
        {
            // Spells define their diameter
            effect.system.transferData.area.radius += " / 2";
        }
    
        let item = test?.item;

        if (test)
        {
            effect.system.sourceData.test = test;
        }

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
    
            else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Round")))
            effect.duration.rounds = duration;
        }

        return effect;
    }

    
    get sourceTest() 
    {
        let testData = this.system.sourceData.test.data
        let message = game.messages.get(testData.context?.messageId);
        if (testData)
        {
            return message ? message.system.test : TestWFRP.recreate(testData);    
        }
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

    get conditionId(){
        return this.key
    }

    get isNumberedCondition() {
        return this.system.condition.numbered
    }

    get conditionValue() 
    {
        return this.system.condition.value ?? this.getFlag("wfrp4e", "value");
    }

    get testIndependent()
    {
        return this.system.transferData.testIndependent
    }

    get isTargetApplied()
    {
        return this.system.transferData.type == "target" || (this.system.transferData.type == "aura" && this.system.transferData.area.aura.transferred)
    }

    get isAreaApplied()
    {
        return this.system.transferData.type == "area"
    }

    get isCrewApplied()
    {
        return this.system.transferData.type == "crew";
    }

    get radius()
    {
        let sizeMod = 0;
        if (this.actor)
        {
            let size = game.wfrp4e.config.tokenSizes[this.actor.system.details.size.value]
            if (size > 1)
            {
                sizeMod = size;
            }
        }
        return super.radius + sizeMod
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
    let flags = foundry.utils.getProperty(data, "flags.wfrp4e");

    if (!flags || flags._legacyData || flags.scriptData || flags.applicationData)
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
        foundry.utils.setProperty(newScript, "options.dialog.targeter", true);
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
            foundry.utils.setProperty(newScript, "options.dialog.activateScript", "return true")
        }

    }
    else if (flags.effectTrigger == "dialogChoice")
    {
        newScript.label = flags.effectData.description || newScript.label
        newScript.script = `
        args.prefillModifiers.modifier += ${flags.effectData.modifier || 0};
        args.prefillModifiers.slBonus += ${flags.effectData.SLBonus || 0};
        args.prefillModifiers.successBonus += ${flags.effectData.successBonus || 0};
        `;
        // Missing difficultyBonus?
    }
    if (newScript.trigger)
    {
        flags.scriptData.push(newScript)
    }

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