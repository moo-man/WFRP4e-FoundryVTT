export default class VehicleMoveConfig extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "vehicle-move"],
        window: {
            title: "VEHICLE.Move",
        },
        position: {
            width: 600,
        },
        form: {
            closeOnSubmit: true,
            handler: this._onSubmit
        },
        actions: {
        }
    }

    static PARTS = {
        form: { scrollable: [""], template: "systems/wfrp4e/templates/apps/vehicle-move.hbs" },
        footer: { template: "templates/generic/form-footer.hbs" }
    }

    constructor(document, options) {
        super(options);
        this.document = document;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.system = this.document.system;
        context.buttons = [{ type: "submit", label: "Submit", icon: "fa-solid fa-save" }]
        return context;
    }

    static async _onSubmit(event, form, formData) {
        if (formData.sailPrimary) {
            formData["system.details.move.primary"] = "sail";
            delete formData.sailPrimary;
        }
        else if (formData.oarsPrimary)
        {
            formData["system.details.move.primary"] = "oars";
            delete formData.oarsPrimary;
        }
        this.document.update(formData.object)
    }

    async _onRender(options)
    {
        await super._onRender(options)
        this.sailSection = this.element.querySelector(".sail");
        this.oarsSection = this.element.querySelector(".oars");

        this.sailEnable = this.element.querySelector("[name='system.details.move.sail.enabled'");
        this.oarsEnable = this.element.querySelector("[name='system.details.move.oars.enabled'");

        this.sailPrimary = this.element.querySelector("[name='sailPrimary']");
        this.oarsPrimary = this.element.querySelector("[name='oarsPrimary']");

        this.element.querySelector(".enableToggle").addEventListener("change", (ev => {
            this.checkToggles()
        }))

        this.element.querySelectorAll(".primaryToggle").forEach(e => e.addEventListener("change", (ev => {
            if (ev.target.name == "sailPrimary" && ev.target.checked)
            {
                this.oarsPrimary.checked = false;
            }
            else if (ev.target.name == "oarsPrimary" && ev.target.checked)
            {
                this.sailPrimary.checked = false;
            }
        })))
        
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