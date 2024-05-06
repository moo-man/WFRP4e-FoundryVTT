export default class VehicleMorale extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes.push("vehicle-morale")
        options.template = "systems/wfrp4e/templates/apps/vehicle-morale.hbs";
        options.width = 600;
        options.resizable = true;
        options.title = "Vehicle Morale"
        return options;
    }

    getData() {
        let data = super.getData()
        data.system = this.object.system;
        return data
    }

    async _updateObject(event, formData) {
        this.object.update(formData)
    }

    activateListeners(html)
    {
        super.activateListeners(html);


        html.find(".starting").change(async ev => {
            await this.object.update({"system.status.morale.starting" : Number(ev.target.value)});
            this.render(true);
        })

        html.find(".sources input").change(async ev => {
            let index = Number(ev.currentTarget.parentElement.dataset.index);
            let sources = foundry.utils.deepClone(this.object.system.status.morale.sources);

            if (ev.currentTarget.type == "checkbox")
            {
                sources[index].active = !sources[index].active                
            }
            else 
            {
                sources[index][ev.currentTarget.name] = ev.currentTarget.value;
            }
            await this.object.update({"system.status.morale.sources" : sources});
            this.render(true);
        })

        html.find(".add-morale").click(async ev => {
            let sources = foundry.utils.deepClone(this.object.system.status.morale.sources);
            sources.push({description : "", formula : "", active : false});
            await this.object.update({"system.status.morale.sources" : sources});
            this.render(true);
        })

        html.find(".remove-morale").click(async ev => {
            let index = Number(ev.currentTarget.parentElement.dataset.index);
            let sources = foundry.utils.deepClone(this.object.system.status.morale.sources);
            sources.splice(index, 1);
            await this.object.update({"system.status.morale.sources" : sources});
            this.render(true);
        })
    }
}