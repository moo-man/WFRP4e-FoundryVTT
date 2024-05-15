export default class VehicleMoveConfig extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes.push("vehicle-move")
        options.template = "systems/wfrp4e/templates/apps/vehicle-move.hbs";
        options.height = "auto";
        options.width = 400;
        options.minimizable = true;
        options.title = "Vehicle Move"
        return options;
    }

    getData() {
        let data = super.getData()
        data.system = this.object.system;
        return data
    }

    async _updateObject(event, formData) {
        if (formData.sailPrimary)
        {
            formData["system.details.move.primary"] = "sail";
            delete formData.sailPrimary;
        }
        else if (formData.oarsPrimary)
        {
            formData["system.details.move.primary"] = "oars";
            delete formData.oarsPrimary;
        }
        this.object.update(formData)
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        this.sailSection = html.find(".sail")[0];
        this.oarsSection = html.find(".oars")[0];

        this.sailEnable = html.find("[name='system.details.move.sail.enabled'")[0];
        this.oarsEnable = html.find("[name='system.details.move.oars.enabled'")[0];

        this.sailPrimary = html.find("[name='sailPrimary']")[0];
        this.oarsPrimary = html.find("[name='oarsPrimary']")[0];

        html.find(".enableToggle").change(ev => {
            this.checkToggles()
        })

        html.find(".primaryToggle").change(ev => {
            if (ev.target.name == "sailPrimary" && ev.target.checked)
            {
                this.oarsPrimary.checked = false;
            }
            else if (ev.target.name == "oarsPrimary" && ev.target.checked)
            {
                this.sailPrimary.checked = false;
            }
        })
        
        this.checkToggles();
    }

    checkToggles()
    {
        if (this.sailEnable.checked && this.sailSection.classList.contains("disabled"))
        {
            this.sailSection.classList.remove("disabled")
        }
        if (!this.sailEnable.checked && !this.sailSection.classList.contains("disabled"))
        {
            this.sailSection.classList.add("disabled")
            this.sailPrimary.checked = false
        }

        if (this.oarsEnable.checked && this.oarsSection.classList.contains("disabled"))
        {
            this.oarsSection.classList.remove("disabled")
        }
        if (!this.oarsEnable.checked && !this.oarsSection.classList.contains("disabled"))
        {
            this.oarsSection.classList.add("disabled")
            this.oarsPrimary.checked = false
        }
    }
}