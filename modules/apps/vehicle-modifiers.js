export default class VehicleCumulativeModifiersConfig extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes.push("vehicle-modifiers")
        options.template = "systems/wfrp4e/templates/apps/vehicle-modifiers.hbs";
        options.width = 600;
        options.resizable = true;
        return options;
    }

    get title()
    {
        return this.key == "morale" ? "Vehicle Morale" : "Manann's Mood"
    }

    get key ()
    {
        return this.options.key;
    }

    getData() {
        if (game.modules.get("foundryvtt-simple-calendar")?.active) 
        {
            this.options.weekLabel = SimpleCalendar.api.currentDateTimeDisplay()?.date
        }
        let data = super.getData()
        data.roll = this.options.roll;
        data.system = this.object.system;
        data.sources = data.system.status[this.key].sources;
        data.starting = data.system.status[this.key].starting

        return data
    }

    async _updateObject(event, formData) {
        this.object.update(formData)
    }

    close() 
    {
        this.object.update({[`system.status.${this.key}.sources`] : this.object.system.status[this.key].sources.filter(i => i.description)});
        super.close();
    }

    activateListeners(html)
    {
        super.activateListeners(html);


        html.find(".starting").change(async ev => {
            await this.object.update({[`system.status.${this.key}.starting`] : Number(ev.target.value)});
            this.render(true);
        })

        html.find(".sources input").change(async ev => {
            let index = Number(ev.currentTarget.parentElement.dataset.index);
            let sources = foundry.utils.deepClone(this.object.system.status[this.key].sources);

            if (ev.currentTarget.type == "checkbox")
            {
                sources[index].active = !sources[index].active                
            }
            else 
            {
                sources[index][ev.currentTarget.name] = ev.currentTarget.value;
            }
            await this.object.update({[`system.status.${this.key}.sources`] : sources.filter(i => i.description)});
            this.render(true);
        })

        html.find(".roll").click(ev => {
            if (!this.options.weekLabel)
            {
                ui.notifications.error("Enter a label for the roll")
            }
            else 
            {
                this.object.system.status[this.key].roll(this.options.weekLabel);
                this.close();
            }
        })

        html.find(".week-label").change(ev => {
            this.options.weekLabel = ev.target.value;
        })

        html.find(".add").click(async ev => {
            let sources = foundry.utils.deepClone(this.object.system.status[this.key].sources);
            sources.push({description : "", formula : "", active : false});
            await this.object.update({[`system.status.${this.key}.sources`] : sources});
            this.render(true);
        })

        html.find(".remove").click(async ev => {
            let index = Number(ev.currentTarget.parentElement.dataset.index);
            let sources = foundry.utils.deepClone(this.object.system.status[this.key].sources);
            sources.splice(index, 1);
            await this.object.update({[`system.status.${this.key}.sources`] : sources});
            this.render(true);
        })
    }
}