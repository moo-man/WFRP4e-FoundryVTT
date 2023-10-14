import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class PhysicalItemModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.quantity = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.encumbrance = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.price = new fields.SchemaField({
            gc: new fields.NumberField(),
            ss: new fields.NumberField(),
            bp: new fields.NumberField()
        });
        schema.availability = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.location = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
    }

}