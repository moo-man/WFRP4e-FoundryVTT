import Advancement from "../../../system/advancement";

let fields = foundry.data.fields;

export class CharacteristicsModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.ws = new fields.EmbeddedDataField(CharacteristicModel);
        schema.bs = new fields.EmbeddedDataField(CharacteristicModel);
        schema.s = new fields.EmbeddedDataField(CharacteristicModel);
        schema.t = new fields.EmbeddedDataField(CharacteristicModel);
        schema.i = new fields.EmbeddedDataField(CharacteristicModel);
        schema.ag = new fields.EmbeddedDataField(CharacteristicModel);
        schema.dex = new fields.EmbeddedDataField(CharacteristicModel);
        schema.int = new fields.EmbeddedDataField(CharacteristicModel);
        schema.wp = new fields.EmbeddedDataField(CharacteristicModel);
        schema.fel = new fields.EmbeddedDataField(CharacteristicModel);
        return schema;
    }


    compute() 
    {
        for(let ch in this)
        {
            this[ch].computeValue();
            this[ch].computeBonus();
            this[ch].computeCost()
        }
    }
}

export class CharacteristicModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.initial = new fields.NumberField({initial : 20});
        schema.modifier = new fields.NumberField({initial : 0});
        schema.advances = new fields.NumberField({initial : 0});
        schema.bonusMod = new fields.NumberField({initial : 0});
        schema.calculationBonusModifier = new fields.NumberField({initial : 0});
        return schema;
    }


    computeValue() 
    {
        this.value = this.initial + this.modifier + this.advances;
    }

    computeBonus() 
    {
        this.bonus = Math.floor(this.value / 10) + this.bonusMod;
    }

    computeCost()
    {
        this.cost = Advancement.calculateAdvCost(this.advances, "characteristic")
    }
}