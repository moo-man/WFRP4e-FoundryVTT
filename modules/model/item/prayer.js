import WFRP_Utility from "../../system/utility-wfrp4e";
import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class PrayerModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();

        schema.type = new fields.SchemaField({
            value : new fields.StringField(),
        });
        schema.god = new fields.SchemaField({
            value : new fields.StringField(),
        });             
        schema.range = new fields.SchemaField({
            value : new fields.StringField(),
        });
        schema.target = new fields.SchemaField({
            value : new fields.StringField(),
            aoe : new fields.BooleanField(),
        });
        schema.duration = new fields.SchemaField({
            value : new fields.StringField(),
            extendable : new fields.BooleanField(),
        });
        schema.damage = new fields.SchemaField({
            dice : new fields.StringField(),
            value : new fields.StringField(),
            addSL : new fields.BooleanField(),
        });
        
        // Embedded Data Models?
        schema.overcast = new fields.SchemaField({
            enabled : new fields.BooleanField(),
            label : new fields.StringField(),
            valuePerOvercast : new fields.SchemaField({
                 type : new fields.StringField(),
                 value : new fields.NumberField({initial : 1}),
                 SL : new fields.BooleanField(),
                 characteristic  : new fields.StringField(),
                 bonus : new fields.BooleanField(),
            }),
            initial : new fields.SchemaField({
                type : new fields.StringField(),
                value : new fields.NumberField({initial : 1}),
                SL : new fields.BooleanField(),
                characteristic  : new fields.StringField(),
                bonus : new fields.BooleanField(),
           }),
        });
        return schema;
    }

    async preCreateData(data, options, user) {
        let preCreateData = await super.preCreateData(data, options, user);

        if (this.parent.isOwned) 
        {
            let actor = this.parent.actor;
            if (actor.type == "character" && this.prayerType.value == "miracle") {
                WFRP_Utility.miracleGainedDialog(this.parent, actor)
            }
        }

        return preCreateData;
    }
}