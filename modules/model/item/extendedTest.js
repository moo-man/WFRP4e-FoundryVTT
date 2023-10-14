import { BaseItemModel } from "./career";
let fields = foundry.data.fields;

export class ExtendedTestModel extends BaseItemModel
{

    static defineSchema() 
    {
        let schema = super.defineSchema();

        schema.SL = new fields.SchemaField({
            current : new fields.NumberField({initial: 0}),
            target : new fields.NumberField({initial: 1}),
        });

        schema.test = new fields.SchemaField({
            value : new fields.StringField({})
        });

        schema.negativePossible = new fields.SchemaField({
            value : new fields.BooleanField({initial : false})
        });

        schema.failingDecreaeses = new fields.SchemaField({
            value : new fields.BooleanField({initial : true})
        });

        schema.completion = new fields.SchemaField({
            value : new fields.StringField({initial : "none"})
        });

        schema.hide = new fields.SchemaField({
            current : new fields.BooleanField({initial: false}),
            target : new fields.BooleanField({initial: false}),
        });

        schema.difficulty = new fields.SchemaField({
            value : new fields.StringField({initial : "challenging"})
        });

        return schema;
    }

    summaryData()
    {

    }
}