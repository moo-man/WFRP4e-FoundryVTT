import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class VehicleRoleModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.test = new fields.StringField();
        return schema;
    }
}