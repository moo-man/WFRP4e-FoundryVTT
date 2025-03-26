import { StandardActorModel } from "./standard";
let fields = foundry.data.fields;

export class NPCModel extends StandardActorModel 
{
    static preventItemTypes = [];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        return schema;
    }
}

