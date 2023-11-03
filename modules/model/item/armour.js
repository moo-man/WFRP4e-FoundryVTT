import { PropertiesItemModel } from "./components/properties";

export class ArmourModel extends PropertiesItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.skill = new fields.StringField();
        schema.advances = new fields.NumberField({min: 0, initial: 0});
        schema.restricted = new fields.BooleanField();
        return schema;
    }


    async preCreateData(data, options, user)
    {
       let preCreateData = await super.preCreateData(data, options, user);

       if (this.parent.isOwned && this.parent.actor.type != "character" && this.parent.actor.type != "vehicle")
       {
          setProperty({preCreateData, "system.worn.value" : true}); // TODO: migrate this into a unified equipped property 
       }
           
       return preCreateData;
    }

}