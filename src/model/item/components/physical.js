import { BaseItemModel } from "./base";
import MarketWFRP4e from "../../../apps/market-wfrp4e.js";
let fields = foundry.data.fields;

export class PhysicalItemModel extends BaseItemModel
{
    static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
        isPhysical: true
    }, {inplace: false}));

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
            value: new fields.NumberField({min: 0}),
            shield: new fields.NumberField({min: 0}),
        });
        return schema;
    }

    static sumPriceValue(price) {
        let value = 0;

        value += Number(price?.gc) * 240 || 0;
        value += Number(price?.ss) * 12 || 0;
        value += Number(price?.bp) || 0;

        return value;
    }

    /** @override */
    static get compendiumBrowserFilters() {
        return new Map([
            ...Array.from(super.compendiumBrowserFilters),
            ["quantity", {
                label: "Quantity",
                type: "range",
                config: {
                    keyPath: "system.quantity.value"
                }
            }],
            ["encumbrance", {
                label: "Encumbrance",
                type: "range",
                config: {
                    keyPath: "system.encumbrance.value"
                }
            }],
            ["price", {
                label: "Price",
                type: "range",
                config: {
                    text: true,
                    valueGetter: (data) => PhysicalItemModel.sumPriceValue(data.system.price),
                    keyPath: "system.price",
                    mutator: ({min, max}) => {
                        min = game.wfrp4e.market.parseMoneyTransactionString(min || "");
                        max = game.wfrp4e.market.parseMoneyTransactionString(max || "");

                        return {
                            min: min ? PhysicalItemModel.sumPriceValue(min) : undefined,
                            max: max ? PhysicalItemModel.sumPriceValue(max) : undefined,
                        };
                    }
                }
            }],
            ["availability", {
                label: "Availability",
                type: "set",
                config: {
                    keyPath: "system.availability.value",
                    choices: game.wfrp4e.config.availability
                }
            }]
        ]);
    }

        /**
     * Used to identify an Item as one being a child of PhysicalItemModel
     *
     * @final
     * @returns {boolean}
     */
        get isPhysical() {
            return true;
        }

        get tags() 
        {
            return super.tags.add("physical");
        }
    

    async _preCreate(data, options, user)
    {
       await super._preCreate(data, options, user);

       // Previously this checked if item was still owned, not sure if that's necessary 
       // It seems that every case where a new item is created, it should clear the location
       this.updateSource({"location.value" :  ""});
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
     * @returns {Promise<ItemWFRP4e>}
     */
    async reduceQuantity(amount = 1) {
        return await this.parent.update({"system.quantity.value": this.quantity.value - amount});
    }

    async split(amount) 
    {
        let actor = this.parent.actor
        if (!actor) 
        {
            return;
        }

        let newItem = this.parent.toObject();
        delete newItem._id;
        let itemUpdate = this.toObject();

        let oldQuantity = this.quantity.value;

        if (this.parent.type == "cargo") 
        {
            oldQuantity = this.encumbrance.value;
        }

        if (amount >= oldQuantity) 
        {
            return ui.notifications.notify(game.i18n.localize("Invalid Quantity"))
        }

        if (this.parent.type == "cargo") 
        {
            newItem.system.encumbrance.value = amount;
            itemUpdate.encumbrance.value -= amount;
        }
        else 
        {
            newItem.system.quantity.value = amount;
            itemUpdate.quantity.value -= amount;
        }
        await actor.update({ items: [newItem, { _id: this.parent.id, system: itemUpdate }] });
    }

    static migrateData(data)
    {
        if (data.location?.value === '0')
        {
            data.location.value = ''
        }
    }
}