export default class VehicleCumulativeModifiersConfig extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "vehicle-modifiers"],
        window: {
            title: "Vehicle Modifiers",
            resizable: true,
        },
        position: {
            width: 600,
            height: 800
        },
        form: {
            submitOnChange: true,
            handler: this._onSubmit
        },
        actions: {
            add : this._onAddSource,
            remove : this._onRemoveSource,
            roll : this._onRoll,
        }
    }

    static PARTS = {
        form : {scrollable: [""], template : "systems/wfrp4e/templates/apps/vehicle-modifiers.hbs"},
        footer : {template : "templates/generic/form-footer.hbs"}
    }

    constructor(document, options)
    {
        super(options);
        this.document = document;
    }

    get title()
    {
        return this.key == "morale" ? game.i18n.localize("VEHICLE.VehicleMorale") : game.i18n.localize("VEHICLE.ManannsMood")
    }

    get key ()
    {
        return this.options.key;
    }

    _rollData = {}

    async _prepareContext(options) {
        if (game.modules.get("foundryvtt-simple-calendar")?.active) 
        {
            this.options.weekLabel = SimpleCalendar.api.currentDateTimeDisplay()?.date
        }
        let context = await super._prepareContext(options)
        context.roll = this.options.roll;
        context.key = this.key;
        context.system = this.document.system;
        context.sources = context.system.status[this.key].sources;
        context.starting = context.system.status[this.key].starting
        context.buttons = [context.roll ?  { type: "roll", label: "Roll", icon: "fa-solid fa-dice", action: "roll" } : { type: "add", label: "Add", icon: "fa-solid fa-plus", action: "add" }]
        return context
    }

    static async _onSubmit(event, form, formData) {
        this.document.update(formData.object)
    }

    close() 
    {
        // Remove any blank sources when the sheet is closed
        this.document.update({[`system.status.${this.key}.sources`] : this.document.system.status[this.key].sources.filter(i => i.description)});
        super.close();
    }

    async _onRender(_context, _options) 
    {
        await super._onRender(_context, _options);
        
        this.element.querySelectorAll(".sources input").forEach(e => {
            e.addEventListener("change", async ev => {
                let index = Number(ev.currentTarget.parentElement.dataset.index);
                let sources = foundry.utils.deepClone(this.document.system.status[this.key].sources);
    
                if (ev.currentTarget.type == "checkbox")
                {
                    sources[index].active = !sources[index].active                
                }
                else 
                {
                    sources[index][ev.currentTarget.dataset.property] = ev.currentTarget.value;
                }
                await this.document.update({[`system.status.${this.key}.sources`] : sources.filter(i => i.description)});
                this.render(true);
            })
        })
    }

    static async _onAddSource(ev, target)
    {
        let sources = foundry.utils.deepClone(this.document.system.status[this.key].sources);
        sources.push({description : "", formula : "", active : false});
        await this.document.update({[`system.status.${this.key}.sources`] : sources});
        this.render(true);
    }

    static async _onRemoveSource(ev, target)
    {
        let index = Number(target.parentElement.dataset.index);
        let sources = foundry.utils.deepClone(this.document.system.status[this.key].sources);
        sources.splice(index, 1);
        await this.document.update({[`system.status.${this.key}.sources`] : sources});
        this.render(true);
    }

    static  async _onRoll(ev, target)
    {
        const formData = new FormDataExtended(this.form).object;
        if (!formData.weekLabel)
        {
            ui.notifications.error(game.i18n.localize("VEHICLE.LabelError"))
        }
        else 
        {
            if (formData.setValue)
            {
                this.document.system.status[this.key].setValue(formData.weekLabel, parseInt(formData.setValue))
            }
            else 
            {
                this.document.system.status[this.key].roll(formData.weekLabel);
            }
            this.close();
        }
    }
}
