import EffectScriptConfig from "./effect-script-config";
import ScriptConfig from "./script-config";

export default class WFRP4eActiveEffectConfig extends ActiveEffectConfig 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes.push("wfrp4e");
        options.width = 610;
        return options;
    }

    async _render(force, options)
    {
        await super._render(force, options);

        let scriptHTML = await renderTemplate("systems/wfrp4e/templates/apps/effect-scripts.hbs", {scripts : this.object.scriptData});
        let effectApplicationHTML = await renderTemplate("systems/wfrp4e/templates/apps/effect-application-config.hbs", this);

        // Add Scripts Tab and tab section
        this.element.find("nav").append(`<a class='item' data-tab="scripts"><i class="fas fa-gavel"></i>${game.i18n.localize("EFFECT.TabWFRP")}</a>`);
        $(`<section class='tab' data-tab="scripts">${scriptHTML}</section>`).insertBefore(this.element.find("footer"));

        // Replace transfer field with Effect Application data (used to derive transfer value)
        this.element.find("[name='transfer']").parents(".form-group").replaceWith(effectApplicationHTML);

        // // Replace attribute key field with a select field
        // let effectsTab = this.element.find("section[data-tab='effects']");

        // // Add a checkbox to toggle between <select> and <input> for effect keys
        // $(`<div class="form-group">
        // <label>${game.i18n.localize("ManualEffectKeys")}</label>
        // <input type="checkbox" class="manual-keys" name="flags.wfrp4e.manualEffectKeys" ${this.object.getFlag("wfrp4e", "manualEffectKeys") ? "checked" : ""}>
        // </div>`).insertBefore(effectsTab.find(".effects-header"));

        // // Replace all key inputs with <select> fields (unless disabled)
        // if (!this.object.getFlag("wfrp4e", "manualEffectKeys"))
        // {
        //     for (let element of effectsTab.find(".key input"))
        //     {
        //         $(element).replaceWith(await renderTemplate("systems/wfrp4e/templates/apps/effect-key-options.hbs", {name : element.name, value : element.value}));
        //     }
        // }

        // Activate Script tab if that is the cause of the rerender. It is added after rendering so won't be automatically handled by the Tabs object
        if (options.data?.flags?.wfrp4e?.scriptData)
        {
            this.activateTab("scripts");
        }
        this.element.css("height", "auto");
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html.on("click", ".add-script", () => 
        {
            let scripts = this.object.scriptData.concat({label : game.i18n.localize("SCRIPT.NewScript"), script : ""});
            return this.submit({preventClose: true, updateData: {
                [`flags.wfrp4e.scriptData`]: scripts
            }});
        });

        html.on("click", ".script-delete", ev => 
        {
            let index = this._getDataAttribute(ev, "index");
            let scripts = this.object.scriptData.filter((value, i) => i != index);
            return this.submit({preventClose: true, updateData: {
                [`flags.wfrp4e.scriptData`]: scripts
            }});
        });

        html.on("click", ".script-edit", ev => 
        {
            let index = this._getDataAttribute(ev, "index");
            new EffectScriptConfig(this.object, {index}).render(true);
        });

        html.on("click", ".script-config", ev => 
        {
            new ScriptConfig(this.object, {path : this._getDataAttribute(ev, "path")}).render(true);
        });

        html.on("change", ".wfrp4e-effect-config input,.wfrp4e-effect-config select", () => 
        {
            this.submit({preventClose: true});
        });

        html.on("change", ".manual-keys", () => 
        {
            this.submit({preventClose: true});
        });

        html.on("click", ".configure-template", () => {
            new EmbeddedMeasuredTemplateConfig(this.object).render(true);
        })
    }

    _getIndex(ev) 
    {
        return Number(this._getDataAttribute(ev, "index"));
    }
  
    _getPath(ev) 
    {
        return this._getDataAttribute(ev, "path");
    }

  
    /**
     * Search for an HTML data property, specified as data-<property>
     * First search target of the event, then search in parent properties
     * 
     * @param {Event} ev Event triggered
     * @param {String} property data-<property> being searched for
     * @returns 
     */
    _getDataAttribute(ev, property)
    {
        let value = ev.target.dataset[property];
  
        if (!value) 
        {
            const parent = $(ev.target).parents(`[data-${property}]`);
            if (parent) 
            {
                value = parent[0]?.dataset[property];
            }
        }
        return value;
    }
  

}


class EmbeddedMeasuredTemplateConfig extends MeasuredTemplateConfig
{
    async _updateObject(event, formData)
    {
        this.object.update({"flags.wfrp4e.applicationData.templateData" : formData});
    }

    async _render(force, options)
    {   
        await super._render(force, options);
        this.element.find("[name='t']")[0].disabled = true;
        this.element.find("[name='x']")[0].disabled = true;
        this.element.find("[name='y']")[0].disabled = true;
        this.element.find("[name='direction']")[0].disabled = true;
        this.element.find("[name='angle']")[0].disabled = true;
        this.element.find("[name='distance']")[0].disabled = true;
        this.element.find("[name='width']")[0].disabled = true;
    }

    async getData()
    {
        let data = await super.getData();
        data.data = this.object.flags.wfrp4e.applicationData.templateData;
        return data;
    }
}