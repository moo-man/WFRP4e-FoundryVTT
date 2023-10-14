import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

/**
 * Represents an Item used by both Patrons and Characters/NPCs
 */
export class DiseaseModel extends BaseItemModel
{

    static defineSchema() 
    {
        let schema = {};
        schema.contraction = new fields.SchemaField({
            value : new fields.StringField(),
        });
        
        schema.incubation = new fields.SchemaField({
            value : new fields.StringField(),
        })

        schema.duration = new fields.SchemaField({
            value : new fields.StringField(),
            unit : new fields.StringField(),
            active : new fields.BooleanField(),
        })

        schema.symptoms = new fields.SchemaField({
            value : new fields.StringField(),
        })

        schema.permanent = new fields.SchemaField({
            value : new fields.StringField(),
        })
        return schema;
    }
}