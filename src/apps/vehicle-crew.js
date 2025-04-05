export default class VehicleCrew extends DraggableApp(HandlebarsApplicationMixin(ApplicationV2))
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "vehicle-crew"],
        window: {
            title: "Vehicle Crew",
            resizable: true,
        },
        position: {
            width: 400,
            height: 500
        },
        form: {
            submitOnChange: true,
            handler: this._onSubmit
        },
        actions: {
            unassign: this._onUnassign,
            deleteRole: this._onDeleteRole,
            openRole: { buttons: [2], handler: this._onOpenRole },
            addRole: this._onAddRole
        },
        dragDrop: [{ dragSelector: '.role', dropSelector: null }],
    }


    /** @override */
    static PARTS = {
        form: {
            template: "systems/wfrp4e/templates/apps/vehicle-crew.hbs",
            scrollable: [""]
        }
    };

    constructor(document, options) {
        super(options);
        this.document = document;
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options)
        context.system = this.document.system;
        context.roles = this.document.itemTypes.vehicleRole
        context.passengers = context.system.passengers.list;
        return context;
    }

    async _onSubmit(event, form, formData) {

    }

    /**
     * Add role id to drag data
     * 
     * @param {DragEvent} ev Drag event
     */
    async _onDragStart(ev) {
        ev.dataTransfer.setData("text/plain", ev.target.dataset.id);
    }

    /**
     * Handle dropping roles onto crew members
     * 
     * @param {Event} ev Drop event 
     */
    async _onDrop(ev) {
        let roleId = ev.dataTransfer.getData("text/plain"); // Dragged role
        let passengerId = ev.target.dataset.id;             // Dropped on passenger

        if (roleId && passengerId) {
            await this.document.update(this.document.system.passengers.addRole(passengerId, roleId));
            this.render(true);
        }
    }

    static async _onUnassign(ev, target) {
        let passengerId = target.closest(".passenger-roles").dataset.id;;
        let roleId = target.dataset.id;

        await this.document.update(this.document.system.passengers.removeRole(passengerId, roleId));
        this.render(true);
    }

    static async _onDeleteRole(ev, target) {
        await this.document.items.get(target.parentElement.dataset.id)?.delete();
        this.render(true);
    }

    static _onOpenRole(ev, target) {
        this.document.items.get(target.parentElement.dataset.id)?.sheet?.render(true);
    }

    static async _onAddRole(ev, target) {
        await this.document.createEmbeddedDocuments("Item", [{ name: game.i18n.localize("VEHICLE.NewRole"), type: "vehicleRole" }], { renderSheet: true });
        this.render(true);
    }
}