import { StandardActorModel } from "./standard";
let fields = foundry.data.fields;

export class CreatureModel extends StandardActorModel 
{
    static preventItemTypes = [];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.excludedTraits = new fields.ArrayField(new fields.StringField())
        return schema;
    }
}

