import ScriptConfig from "./script-config";

export default class EffectScriptConfig extends ScriptConfig
{
    scriptLock = true; // User lock toggled

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes.push("effect-script");
        return options;
    }

    get scriptLocked()
    {
        return this._hasScriptReferences() && this.scriptLock;
    }

    async getData() 
    {
        let data = await super.getData();
        data.hasScriptReferences = this._hasScriptReferences();
        data.scriptLock = data.hasScriptReferences && this.scriptLock;
        data.lockedScripts = {
            "script" : this._isScriptReference("script") && this.scriptLock,
            "hideScript" : this._isScriptReference("hideScript") && this.scriptLock,
            "activateScript" : this._isScriptReference("activateScript") && this.scriptLock,
            "submissionScript" : this._isScriptReference("submissionScript") && this.scriptLock
        };
        data.dereferencedScripts = this._dereferencedScripts();
        data.script = this._getScript();
        data.extraFieldsHTML = await this._renderExtraFields(data.dereferencedScripts, data.lockedScripts);
        return data;
    }

    _dereferencedScripts()
    {
        let object = this._getScriptObject();
        let data = {};
        let regex = /\[Script.([a-zA-Z0-9]{16})\]/gm;
        let matches = Array.from(object.script.matchAll(regex));
        let scriptId = matches[0]?.[1];
        let hideId = Array.from((object.options?.dialog.hideScript || "").matchAll(regex))[0]?.[1];
        let activateId = Array.from((object.options?.dialog.activateScript || "").matchAll(regex))[0]?.[1];
        let submissionId = Array.from((object.options?.dialog.submissionScript || "").matchAll(regex))[0]?.[1];

        data.script = game.wfrp4e.config.effectScripts[scriptId] || object.script;
        setProperty(data, "options.dialog.hideScript", (game.wfrp4e.config.effectScripts[hideId] || object.options?.dialog.hideScript));
        setProperty(data, "options.dialog.activateScript", (game.wfrp4e.config.effectScripts[activateId] || object.options?.dialog.activateScript));
        setProperty(data, "options.dialog.submissionScript", (game.wfrp4e.config.effectScripts[submissionId] || object.options?.dialog.submissionScript));
        return data;
    }

    _renderExtraFields(dereferencedScripts, lockedScripts)
    {
        return renderTemplate("systems/wfrp4e/templates/apps/script-fields.hbs", {script: this._getScriptObject(), dereferencedScripts, lockedScripts});
    }

    _getScript()
    {
        return this._getScriptObject()?.script;
    }

    _getScriptObject()
    {
        let data = foundry.utils.deepClone(getProperty(this.object, "flags.wfrp4e.scriptData")?.[this.options.index]);
        return data;
    }

    _isScriptReference(type)
    {
        let regex = /\[Script.([a-zA-Z0-9]{16})\]/gm;
        let object = this._getScriptObject();
        if (type == "script")
        {
            return !!object.script.match(regex);
        }
        else 
        {
            return !!(getProperty(object, "options.dialog." + type) || "").match(regex);
        }
    }

    _hasScriptReferences()
    {
        return this._isScriptReference("script") || this._isScriptReference("hideScript") || this._isScriptReference("activateScript") || this._isScriptReference("submissionScript");
    }

    async _updateObject(ev, formData)
    {
        let script = this.aceActive ? this.editor.getValue() : formData.script; 

        let array = foundry.utils.deepClone(getProperty(this.object, "flags.wfrp4e.scriptData"));
        let scriptObject = array[this.options.index];
        scriptObject.label = formData.label;
        scriptObject.trigger = formData.trigger;
        if (formData.hideScript)
        {
            setProperty(scriptObject, "options.dialog.hideScript", formData.hideScript);
        }
        if (formData.activateScript)
        {
            setProperty(scriptObject, "options.dialog.activateScript", formData.activateScript);
        }
        if (formData.submissionScript)
        {
            setProperty(scriptObject, "options.dialog.submissionScript", formData.submissionScript);
        }
        
        setProperty(scriptObject, "options.dialog.targeter", formData.targeter);
        setProperty(scriptObject, "options.immediate.deleteEffect", formData.deleteEffect);
        if(script)
        {
            scriptObject.script = script;
        }

        return this.object.update({"flags.wfrp4e.scriptData" : array});
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        this.hideTriggerOptions(html);

        html.find("[name='trigger']").change(ev => 
        {
            this.showTriggerOptions(ev.currentTarget.value);
        });

        html.find(".script-lock").change(ev => 
        {
            this.scriptLock = ev.currentTarget.checked;
            this.render(true);
        });

        this.showTriggerOptions(this._getScriptObject().trigger);
    }

    showTriggerOptions(trigger)
    {
        this.hideTriggerOptions(this.element);

        if (trigger)
        {
            this.element.find(`[data-option=${trigger}]`).show();
        }

        if (this.aceActive)
            this.editor.resize();
    }

    hideTriggerOptions(html)
    {
        html.find("[data-option]").hide();
    }
}