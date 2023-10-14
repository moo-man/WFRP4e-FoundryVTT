import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class TalentModel extends BaseItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.max = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.advances = new fields.SchemaField({
            value: new fields.NumberField(),
            force: new fields.BooleanField()
        })
        schema.career = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.tests = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }
}