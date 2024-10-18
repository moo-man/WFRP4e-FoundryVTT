
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
        return new game.wfrp4e.opposedHandler(this.opposedData);
    }
}