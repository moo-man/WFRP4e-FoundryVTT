

export default class HomebrewConfig extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "homebrew-config"],
        window: {
            title: "Homebrew Settings Configuration",
            contentClasses: ["standard-form"],
            resizable : true,
        },
        position : {
            width: 400
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false,
            handler: this._onSubmit
        }
    }


    static #schema = new foundry.data.fields.SchemaField({

        channelingNegativeSLTests : new foundry.data.fields.BooleanField({label : "SETTINGS.ChannelingNegativeSL", hint : "SETTINGS.ChannelingNegativeSLHint"}),
        advantageBonus : new foundry.data.fields.NumberField({initial : 10, label : "SETTINGS.AdvantageBonus", hint : "SETTINGS.AdvantageBonusHint"}),
        uiaCritsMod : new foundry.data.fields.NumberField({initial: 10, label : "SETTINGS.UIACritsMod", hint : "SETTINGS.UIACritsModHint"}),
        partialChannelling : new foundry.data.fields.BooleanField({label : "SETTINGS.PartialChannelling", hint : "SETTINGS.PartialChannellingHint"}),
        channellingIngredients : new foundry.data.fields.BooleanField({label : "SETTINGS.ChannellingIngredients", hint : "SETTINGS.ChannellingIngredientsHint"}),
        unofficialgrimoire : new foundry.data.fields.BooleanField({label : "SETTINGS.UnofficialGrimoire", hint : ""}),
        
        mooAdvantage : new foundry.data.fields.BooleanField({label : "SETTINGS.MooAdvantage", hint : "SETTINGS.MooAdvantageHint"}),
        mooDifficulty : new foundry.data.fields.BooleanField({label : "SETTINGS.MooDifficulty", hint : "SETTINGS.MooDifficultyHint"}),
        // mooCritsFumbles : new foundry.data.fields.BooleanField({label : "SETTINGS.MooCritsFumbles", hint : "SETTINGS.MooCritsFumblesHint"}),
        mooConditions : new foundry.data.fields.BooleanField({label : "SETTINGS.MooConditions", hint : "SETTINGS.MooConditionsHint"}),
        mooConditionTriggers : new foundry.data.fields.BooleanField({label : "SETTINGS.MooConditionTriggers", hint : "SETTINGS.MooConditionTriggersHint"}),
        mooCritModifiers : new foundry.data.fields.BooleanField({label : "SETTINGS.MooCritModifiers", hint : "SETTINGS.MooCritModifiersHint"}),
        mooSLDamage : new foundry.data.fields.BooleanField({label : "SETTINGS.MooSLDamage", hint : "SETTINGS.MooSLDamageHint"}),
        mooRangedDamage : new foundry.data.fields.BooleanField({label : "SETTINGS.MooRangedDamage", hint : "SETTINGS.MooRangedDamageHint"}),
        mooMagicAdvantage : new foundry.data.fields.BooleanField({label : "SETTINGS.MooMagicAdvantage", hint : "SETTINGS.MooMagicAdvantageHint"}),
        mooOvercasting : new foundry.data.fields.BooleanField({label : "SETTINGS.MooOvercasting", hint : "SETTINGS.MooOvercastingHint"}),
        mooCatastrophicMiscasts : new foundry.data.fields.BooleanField({label : "SETTINGS.MooCatastrophicMiscasts", hint : "SETTINGS.MooCatastrophicMiscastsHint"}),
        mooCriticalChannelling : new foundry.data.fields.BooleanField({label : "SETTINGS.MooCriticalChannelling", hint : "SETTINGS.MooCriticalChannellingHint"}),
        mooCastAfterChannelling : new foundry.data.fields.BooleanField({label : "SETTINGS.MooCastAfterChannelling", hint : "SETTINGS.MooCastAfterChannellingHint"}),
        mooPenetrating : new foundry.data.fields.BooleanField({label : "SETTINGS.MooPenetrating", hint : "SETTINGS.MooPenetratingHint"}),
        mooQualities : new foundry.data.fields.BooleanField({label : "SETTINGS.MooQualities", hint : "SETTINGS.MooQualitiesHint"}),
        mooShieldAP : new foundry.data.fields.BooleanField({label : "SETTINGS.MooShieldAP", hint : "SETTINGS.MooShieldAPHint"}),
        mooCriticalMitigation : new foundry.data.fields.BooleanField({label : "SETTINGS.MooCriticalMitigation", hint : "SETTINGS.MooCriticalMitigationHint"}),
        mooRangeBands : new foundry.data.fields.BooleanField({label : "SETTINGS.MooRangeBands", hint : "SETTINGS.MooRangeBandsHint"}),
        mooSizeDamage : new foundry.data.fields.BooleanField({label : "SETTINGS.MooSizeDamage", hint : "SETTINGS.MooSizeDamageHint"}),
        mooHomebrewItemChanges : new foundry.data.fields.BooleanField({label : "SETTINGS.MooHomebrewItems", hint : "SETTINGS.MooHomebrewItemHint"})
    })

    /** @override */
    static PARTS = {
        form: {
            template: "systems/wfrp4e/templates/apps/homebrew-settings.hbs",
            scrollable: [""],
            classes: ["standard-form"]
        }
    };

    static get schema()
    {
        return this.#schema
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.source = game.settings.get("wfrp4e", "homebrew");
        context.schema = this.constructor.schema
        return context;
    }


    static async _onSubmit(event, form, formData) 
    {
        game.settings.set("wfrp4e", "homebrew", formData.object)
    }

}