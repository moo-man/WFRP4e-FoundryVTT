import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class VehicleTestModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.roles = new fields.StringField();
        return schema;
    }
}