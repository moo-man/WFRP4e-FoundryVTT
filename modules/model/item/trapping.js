import { PropertiesItemModel } from "./components/properties";

let fields = foundry.data.fields;


export class TrappingModel extends PropertiesItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.trappingType = new fields.SchemaField({
            value: new fields.StringField()
        }),
        schema.spellIngredient = new fields.SchemaField({
            value: new fields.StringField()
        })
        schema.worn = new fields.BooleanField()
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }


    async preCreateData(data, options, user)
    {
       let preCreateData = await super.preCreateData(data, options, user);

       if (this.trappingType == "clothingAccessories" && this.parent.isOwned && this.parent.actor.type != "character" && this.parent.actor.type != "vehicle")
       {
          setProperty({preCreateData, "system.worn" : true}); // TODO: migrate this into a unified equipped property 
       }
           
       return preCreateData;
    }

}