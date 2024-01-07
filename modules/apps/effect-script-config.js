import ScriptConfig from "./script-config";

export default class EffectScriptConfig extends ScriptConfig
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes.push("effect-script");
        return options;
    }

    async getData() 
    {
        let data = await super.getData();
        data.extraFieldsHTML = await this._renderExtraFields();
        return data;
    }

    _renderExtraFields()
    {
        return renderTemplate("systems/wfrp4e/templates/apps/script-fields.hbs", {script : this._getScriptObject(), effect : this.object});
    }

    _getScript()
    {
        return this._getScriptObject()?.script;
    }

    _getScriptObject()
    {
        return getProperty(this.object, "flags.wfrp4e.scriptData")?.[this.options.index];
    }

    async _updateObject(ev, formData)
    {
        let script = this.aceActive ? this.editor.getValue() : formData.script; 

        let array = foundry.utils.deepClone(getProperty(this.object, "flags.wfrp4e.scriptData"));
        let scriptObject = array[this.options.index];
        scriptObject.label = formData.label;
        scriptObject.trigger = formData.trigger;
        setProperty(scriptObject, "options.dialog.hideScript", formData.hideScript);
        setProperty(scriptObject, "options.dialog.activateScript", formData.activateScript);
        setProperty(scriptObject, "options.dialog.submissionScript", formData.submissionScript);
        setProperty(scriptObject, "options.dialog.targeter", formData.targeter);
        setProperty(scriptObject, "options.immediate.deleteEffect", formData.deleteEffect);
        scriptObject.script = script;

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
        // this.setTextboxHeight();
    }

    hideTriggerOptions(html)
    {
        html.find("[data-option]").hide();
    }
}