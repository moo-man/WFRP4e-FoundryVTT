import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class CriticalModel extends BaseItemModel 
{
    // allowedConditions = ["bleeding", "stunned", "blinded", "deafened", "incapacitated", "prone", "stunned", "fatigued"];
    // allowedEffectApplications = ["document"];
    // effectApplicationOptions = {documentType : "Actor"};
    
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.wounds = new fields.SchemaField({
            value : new fields.StringField(),
        });
        
        schema.modifier = new fields.SchemaField({
            value : new fields.StringField(),
        })

        schema.location = new fields.SchemaField({
            value : new fields.StringField(),
        })
        return schema;
    }

}