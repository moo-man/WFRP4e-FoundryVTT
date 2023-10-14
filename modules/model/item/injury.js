import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class InjuryModel extends BaseItemModel 
{
    // allowedConditions = ["bleeding", "stunned", "blinded", "deafened", "incapacitated", "prone", "stunned"];
    // allowedEffectApplications = ["document"];
    // effectApplicationOptions = {documentType : "Actor"};

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.location = new fields.SchemaField({
            value : new fields.StringField(),
        });
        
        schema.penalty = new fields.SchemaField({
            value : new fields.StringField(),
        })

        schema.duration = new fields.SchemaField({
            value : new fields.StringField(),
            active : new fields.BooleanField(),
            permanent : new fields.BooleanField(),
        });
        return schema;
    }

}