import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class MutationModel extends BaseItemModel
{
    static defineSchema() 
    {
        // Patron Fields
        let schema = super.defineSchema();
        schema.mutationType = new fields.SchemaField({
            value : new fields.StringField(),
        });
        
        schema.modifier = new fields.SchemaField({
            value : new fields.StringField(),
        })

        schema.modifiesSkills = new fields.SchemaField({
            value : new fields.BooleanField(),
        });

        return schema;
    }

}