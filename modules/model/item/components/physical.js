import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class PhysicalItemModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.quantity = new fields.SchemaField({
            value: new fields.NumberField({initial: 1, min : 0})
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
        schema.damageToItem = new fields.SchemaField({
            value: new fields.NumberField(),
            shield: new fields.NumberField(),
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
        this.encumbrance.total = 0;
        super.computeBase();

        this.encumbrance.total = this.computeEncumbrance();
    }

    computeEncumbrance() 
    {
        let enc = 0;
        if (this.encumbrance && this.quantity) 
        {
            enc = (this.encumbrance.value * this.quantity.value)
            if (this.encumbrance.value % 1 != 0)
            {
                enc = enc.toFixed(2)
            }

            if (this.isEquipped) 
            {
                enc = Math.max(0, enc - 1)
            }
        }
        return enc
    }

/**
 * Helper method to apply damage to an item
 * 
 * @param {number} value Damage the item by this amount
 */
    damageItem(value = 1) 
    {
        // Can ignore .shield because that is exclusive to weapons
        let currentDamage = this.damageToItem.value + value;

        // If maxDamageTaken is undefined, there is no max
        let max = this.maxDamageTaken()
        if (max && currentDamage > max) 
        {
            currentDamage = max;
        }

        return this.parent.update({ [`system.damageToItem.value`]: currentDamage})
    }


    /**
     * Defines the amount of damage this item can take
     * @abstract
     */
    maxDamageTaken()
    {

    }

    /**
     * Reduces the quantity of this Item by specified amount.
     *
     * @param {number} amount by how much should the quantity be reduced?
     *
     * @returns {Promise<ItemWfrp4e>}
     */
    async reduceQuantity(amount = 1) {
        return await this.parent.update({"system.quantity.value": this.quantity.value - amount});
    }

    static migrateData(data)
    {
        if (data.location?.value === '0')
        {
            data.location.value = ''
        }
    }
}