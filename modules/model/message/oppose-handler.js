import OpposedHandler from "../../system/opposed-handler";

let fields = foundry.data.fields;
export class OpposedHandlerMessage extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.opposedData = new fields.ObjectField();
        return schema;
    }

    get opposedHandler() 
    {
        return new OpposedHandler(this.opposedData);
    }
}