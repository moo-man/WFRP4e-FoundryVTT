import { PhysicalItemModel } from "./components/physical";

let fields = foundry.data.fields;

export class VehicleModItem extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.modType = new fields.SchemaField({
            value : new fields.StringField({})
        })
        return schema;
    }
}