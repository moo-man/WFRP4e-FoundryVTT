let fields = foundry.data.fields;

export class MountModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        return {
            id : new fields.StringField({initial : ""}),
            mounted : new fields.BooleanField({initial : false}),
            isToken : new fields.BooleanField({initial : false}),
            tokenData : new fields.SchemaField({
                scene : new fields.StringField({initial : ""}),
                token : new fields.StringField({initial : ""})
            }),
        }
    }
}