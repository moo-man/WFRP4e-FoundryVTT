import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class PhysicalItemModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.quantity = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.encumbrance = new fields.SchemaField({
            value: new fields.NumberField()
        });
        schema.price = new fields.SchemaField({
            gc: new fields.NumberField(),
            ss: new fields.NumberField(),
            bp: new fields.NumberField()
        });
        schema.availability = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.location = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }

    async preCreateData(data, options, user)
    {
       let preCreateData = await super.preCreateData(data, options, user);

       // Previously this checked if item was still owned, not sure if that's necessary 
       // It seems that every case where a new item is created, it should clear the location
       setProperty(preCreateData, "system.location.value",  "");

       return preCreateData;
    }

    computeBase() 
    {
        super.computeBase();

        if (this.encumbrance && this.quantity) 
        {
            this.encumbrance.value = (this.encumbrance.value * this.quantity.value)
            if (this.encumbrance.value % 1 != 0)
            {
                this.encumbrance.value = this.encumbrance.value.toFixed(2)
            }
        }
    }

}