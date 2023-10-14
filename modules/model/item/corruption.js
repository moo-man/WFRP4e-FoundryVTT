import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class CorruptionModel extends BaseItemModel 
{
    // allowedEffectApplications = ["document"];
    // effectApplicationOptions = {documentType : "Actor"};

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.category = new fields.StringField();
        return schema;
    }
}