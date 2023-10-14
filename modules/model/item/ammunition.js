import { PropertiesItemModel } from "./components/properties";
let fields = foundry.data.fields;

export class AmmunitionModel extends PropertiesItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.ammunitionType = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.range = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.damage = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.ammunitionType = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.special = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
    }
}