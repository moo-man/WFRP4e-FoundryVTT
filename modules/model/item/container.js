import { PhysicalItemModel } from "./components/physical";
let fields = foundry.data.fields;

export class ContainerModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.worn = new fields.SchemaField({
            value: new fields.BooleanField()
        });
        schema.wearable = new fields.SchemaField({
            value: new fields.BooleanField()
        });
        schema.carries = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.countEnc = new fields.SchemaField({
            value: new fields.BooleanField()
        });
        
        return schema;
    }

}