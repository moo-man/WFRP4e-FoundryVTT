import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class GenericAspectModel extends BaseItemModel
{
    static placement = "talents"
    static label = "Aspect"
    static plural = "Aspects"

    static defineSchema() 
    {
        let schema = super.defineSchema();

        schema.use = new fields.SchemaField({
            formula : new fields.StringField({initial : ""}),
            skill : new fields.StringField({initial : ""})
        })

        return schema;
    }

    get placement() 
    {
        return this.constructor.placement;
    }

    get label() 
    {
        return this.constructor.label;
    }

    
    get pluralLabel() 
    {
        return this.constructor.plural;
    }
}