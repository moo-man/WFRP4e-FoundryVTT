import { PhysicalItemModel } from "./components/physical";

let fields = foundry.data.fields;

export class MoneyModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();

        schema.coinValue = new fields.SchemaField({
            value : new fields.StringField({initial: 1}),
        });

        return schema;
    }
}