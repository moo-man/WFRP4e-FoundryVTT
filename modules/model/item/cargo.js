import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class CargoModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.cargoType = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.unitPrice = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.origin = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.quality = new fields.SchemaField({
            value: new fields.StringField({initial : "average"})
        });
        return schema;
    }
}