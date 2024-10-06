export default class VehicleCrew extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes.push("vehicle-crew")
        options.template = "systems/wfrp4e/templates/apps/vehicle-crew.hbs";
        options.resizable = true;
        options.submitOnChange = true;
        options.height = 500;
        options.width = 400;
        options.title = game.i18n.localize("VEHICLE.VehicleCrew")
        return options;
    }

    getData() {
        let data = super.getData()
        data.system = this.object.system;
        data.roles = this.object.itemTypes.vehicleRole
        data.passengers = data.system.passengers.list;
        return data
    }

    async _updateObject(event, formData) {
        this.object.update(formData)
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        let dragDrop = new DragDrop(
            {dragSelector : '.role', dropSelector : ".passenger-roles", callbacks: {
                dragstart : this._dragRole.bind(this),
                drop : this._dropRole.bind(this)
            }})

        dragDrop.bind(html[0]);

        html.find(".add-role").click(async ev => {
            await this.object.createEmbeddedDocuments("Item", [{name : game.i18n.localize("VEHICLE.NewRole"), type : "vehicleRole"}], {renderSheet: true});
            this.render(true);
        })

        html.find(".role").contextmenu(async ev => {
            this.object.items.get(ev.currentTarget.dataset.id)?.sheet?.render(true);
        })

        html.find(".delete-role").click(async ev => {
            ev.stopPropagation();
            await this.object.items.get(ev.currentTarget.parentElement.dataset.id)?.delete();
            this.render(true);
        })

        html.find(".unassign-role").click(async ev => {
            let passengerId = $(ev.currentTarget).parents(".passenger-roles").attr("data-id");
            let roleId = ev.currentTarget.dataset.id;

            await this.object.update(this.object.system.passengers.removeRole(passengerId, roleId));
            this.render(true);
        })

    }

     _dragRole(ev)
     {
        ev.dataTransfer.setData("text/plain", ev.target.dataset.id);
     }

     async _dropRole(ev)
     {
        let roleId = ev.dataTransfer.getData("text/plain");
        let passengerId = ev.target.dataset.id;

        await this.object.update(this.object.system.passengers.addRole(passengerId, roleId));
        this.render(true);
     }


}