import WFRP_Utility from "../system/utility-wfrp4e";


export default class WFRPActiveEffectConfig extends ActiveEffectConfig {


    static get defaultOptions() 
    {
        let options = super.defaultOptions;
        options.resizable = true;
        return options;
    }

    async getData() {
        let data = await super.getData()
        data.effectTriggers = game.wfrp4e.config.effectTriggers;
        let type = getProperty(data, "effect.flags.wfrp4e.effectTrigger")
        if (type && type != "dialogChoice")
        {
            data.showEditor = true;
            data.placeholder = game.wfrp4e.config.effectPlaceholder[type] + game.wfrp4e.config.effectPlaceholder.this
            if (game.wfrp4e.config.syncEffectTriggers.indexOf(type) === -1)
                data.showCanBeAsync = true;
        }

        if (type == "prepareItem" || type == "prePrepareItem")
        {
            data.promptChoice = true;
        }

        if (this.object.flags.wfrp4e?.promptItem)
        {
            data.showExtra = true;
            data.extraPlaceholder = game.i18n.localize("EFFECT.ItemFilters");
        }

        data.effectApplication = duplicate(game.wfrp4e.config.effectApplication)
        if (this.object.parent.documentName == "Item")
        {
            if (this.object.parent.type == "weapon" || this.object.parent.type == "armour" || this.object.parent.type=="trapping" || this.object.parent.type=="ammo")
            {
                if (this.object.parent.type=="trapping" && this.object.parent.system.trappingType.value != "clothingAccessories")
                    delete data.effectApplication.equipped
            }
            if (this.object.parent.type == "spell" || this.object.parent.type == "prayer")
            {
                delete data.effectApplication.equipped
                delete data.effectApplication.actor

                // When a spell's range and target is "You", it automatically applies to the caster, not the targets. In rare cases, this needs to be bypassed
                if (this.object.parent.system.target.value == game.i18n.localize("You") && this.object.parent.system.range.value == game.i18n.localize("You"))
                    data.notSelfOption = game.i18n.localize("WFRP4E.NotSelf");
            }
            if (this.object.parent.type == "talent" || this.object.parent.type == "trait" || this.object.parent.type == "psychology" || this.object.parent.type == "disease" || this.object.parent.type == "injury" || this.object.parent.type == "critical")
            {
                if (this.object.parent.type != "trait")
                    delete data.effectApplication.damage
                
                delete data.effectApplication.equipped
            }
            if (this.object.parent.type == "trapping" && (this.object.trigger == "invoke" || this.object.application == "apply"))
            {
                data.quantityOption = true;
            }
        }
        else // if actor effect
        {
            delete data.effectApplication.equipped
            delete data.effectApplication.damage
            delete data.effectApplication.item
        }

        if (this.object.application == "damage")
        {
            data.effect.flags.wfrp4e.effectTrigger = "applyDamage"
            data.disableTrigger = true;
        }

        data.aceActive = game.modules.get("acelib")?.active;

        return data
    }

    get template() {
        return "systems/wfrp4e/templates/apps/active-effect-config.hbs"
    }

    async _updateObject(event, formData) {
        if (this.aceEditor)
        {
            formData["flags.wfrp4e.script"] = this.aceEditor.getValue();
        }
        await super._updateObject(event, formData)
    }


    activateListeners(html){
        super.activateListeners(html);

        try 
        {
            if (game.modules.get("acelib")?.active)
            {
                this.aceEditor = ace.edit(html.find(".ace-editor input")[0]);
                this.aceEditor.setOptions(mergeObject(ace.userSettings, {theme : "ace/theme/chaos", mode : "ace/mode/js", keyboardHandler : "ace/mode/vscode"}))
                this.aceEditor.setValue(this.object.flags.wfrp4e?.script);
            }
        }
        catch(e)
        {
            WFRP_Utility.log("Error initializing ACE Editor: " + e, true)
        }


        this.effectTriggerSelect = html.find(".effect-type").change(ev => {
            this.effectApplicationSelect.value = ""
            this.submit({preventClose : true})
        })

        this.effectApplicationSelect = html.find(".effect-application").change(ev => {

            if (ev.target.value == "damage")
                this.effectTriggerSelect.value = "applyDamage"
            if (ev.target.value == "invoke")
                this.effectTriggerSelect.value = ""
                
            this.submit({preventClose : true})
        })

        this.effectApplicationSelect = html.find("input").change(ev => {
            this.submit({preventClose : true})
        })
    }   

}