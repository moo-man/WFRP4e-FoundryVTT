import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class VehicleRoleModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.test = new fields.StringField();
        return schema;
    }

    isVitalFor(test) {
        return test.system.roles.vital.split(",").map(i => i.trim()).includes(this.parent.name);
    }
}