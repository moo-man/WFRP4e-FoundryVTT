import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class TraitModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();

        schema.rollable = new fields.SchemaField({
            value : new fields.BooleanField({}),
            damage : new fields.BooleanField({}),
            skill : new fields.StringField({}),
            rollCharacteristic : new fields.StringField({}),
            bonusCharacteristic : new fields.StringField({}),
            dice : new fields.StringField({}),
            defaultDifficulty : new fields.StringField({}),
            SL : new fields.BooleanField({}),
            attackType : new fields.StringField({initial: "melee"}),
        });

        schema.specification = new fields.SchemaField({
            value : new fields.StringField(),
        });

        schema.qualities = new fields.SchemaField({
            value: new fields.ArrayField(new fields.ObjectField({}))
        });

        schema.flaws = new fields.SchemaField({
            value: new fields.ArrayField(new fields.ObjectField({}))
        });
    
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
    }

    computeOwnerDerived(actor) 
    {

    }

    get isMelee()
    {
        return this.attackType == "melee";
    }

    get isRanged()
    {
        return this.attackType == "ranged";
    }


}