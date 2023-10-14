import { PropertiesItemModel } from "./components/properties";

let fields = foundry.data.fields;


export class TrappingModel extends PropertiesItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.trappingType = new fields.SchemaField({
            value: new fields.StringField()
        }),
        schema.spellIngredient = new fields.SchemaField({
            value: new fields.StringField()
        })
        schema.worn = new fields.BooleanField()
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }

    summaryData()
    {
        let data = super.summaryData();
        data.tags = data.tags.concat(this.traits.htmlArray);
        return data;
    }
}