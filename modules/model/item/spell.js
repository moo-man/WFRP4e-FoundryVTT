import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class SpellModel extends BaseItemModel
{
    static defineSchema()
    {
        let schema = super.defineSchema();

        schema.lore = new fields.SchemaField({
            value : new fields.StringField(),
            effectString : new fields.StringField(),
        });        
        schema.range = new fields.SchemaField({
            value : new fields.StringField(),
            vortex : new fields.BooleanField(),
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
        });
        schema.cn = new fields.SchemaField({
            value : new fields.NumberField(),
            SL : new fields.NumberField(),
        });
        schema.magicMissile = new fields.SchemaField({
            value : new fields.BooleanField(),
        });
        schema.ritual = new fields.SchemaField({
            value : new fields.BooleanField(),
            type : new fields.StringField(),
            xp : new fields.NumberField(),
        });
        schema.memorized = new fields.SchemaField({
            value : new fields.BooleanField(),
        });
        schema.skill = new fields.SchemaField({
            value : new fields.StringField(),
        });
        schema.ingredients = new fields.ArrayField(new fields.StringField());
        schema.currentIng = new fields.SchemaField({
            value : new fields.StringField(),
        });
        schema.wind = new fields.SchemaField({
            value : new fields.StringField(),
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

   
}