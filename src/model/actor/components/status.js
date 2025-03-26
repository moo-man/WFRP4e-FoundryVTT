import { MountModel } from "./mount";
import { ManannMoodModel } from "./vehicle/mood";
import { MoraleModel } from "./vehicle/morale";

let fields = foundry.data.fields;

export class StandardStatusModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.advantage = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField({})
        });

        schema.wounds = new fields.SchemaField({
            value: new fields.NumberField({ initial: 8, min : 0}),
            max: new fields.NumberField({initial: 8, min : 0}),
        });
        schema.criticalWounds = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0, min : 0 }),
            max: new fields.NumberField(),
        });
        schema.sin = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0, min : 0 })
        });

        schema.corruption = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0, min : 0 }),
            max : new fields.NumberField({initial : 0})
        });

        schema.encumbrance = new fields.SchemaField({
            current: new fields.NumberField({ initial: 0, min : 0 }),
            max: new fields.NumberField({ initial: 0 }),
        });

        schema.ward = new fields.SchemaField({
            value : new fields.NumberField({ initial: 0 }),
            // sources : new fields.ArrayField(new fields.StringField())
        })
        schema.mount = new fields.EmbeddedDataField(MountModel)
        return schema;
    }

    initializeArmour()
    {
        this.armour = {
            head: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Head"),
                show: true,
            },
            body: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Body"),
                show: true
            },
            rArm: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Right Arm"),
                show: true
            },
            lArm: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Left Arm"),
                show: true
            },
            rLeg: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Right Leg"),
                show: true

            },
            lLeg: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Left Leg"),
                show: true
            },
            shield: 0,
            shieldDamage: 0
        }
    }

    // Add armour values from armour items specifically
    addArmourItem(item) {
        // If the armor protects a certain location, add the AP value of the armor to the AP object's location value
        // Then pass it to addLayer to parse out important information about the armor layer, namely qualities/flaws
        for (let loc in item.system.currentAP) {
          if (item.system.currentAP[loc] > 0) {
    
            this.armour[loc].value += item.system.currentAP[loc];
    
            let layer = {
              value: item.system.currentAP[loc],
              armourType: item.system.armorType.value, // used for sound
              source : item
            }
    
            let properties = item.system.properties
            layer.impenetrable = !!properties.qualities.impenetrable;
            layer.partial = !!properties.flaws.partial;
            layer.weakpoints = !!properties.flaws.weakpoints;
            layer.magical = item.system.isMagical;
    
            layer.metal = item.system.isMetal;
    
            this.armour[loc].layers.push(layer);
          }
        }
    }

    // Add armour values from shield items specifically
    addShieldItem(item)
    {
        this.armour.shield += item.properties.qualities.shield.value - Math.max(0, item.damageToItem.shield - Number(item.properties.qualities.durable?.value || 0));
        this.armour.shieldDamage += item.damageToItem.shield;
    }

    // General function (usually used by scripts) to add armour values
    addArmour(value, {locations=[], source=null, metal=false, magical=false, impenetrable=false, partial=false, weakpoints=false, damage={}}={})
    {
        if (!locations || locations.length == 0)
        {
            // If no locations provided, assume all
            locations = ["lArm", "rArm", "lLeg", "rLeg", "body", "head"]
        }

        if (typeof locations == "string")
        {
            locations = [locations];
        }

        for(let loc of locations)
        {
            // Subtract damage from protection value, can't be below 0
            let armour = Math.max(0, value - (damage[loc] || 0))
            this.armour[loc].value += armour
            
            this.armour[loc].layers.push({
                source,
                impenetrable,
                partial,
                weakpoints,
                magical,
                metal,
                value : armour
            })
        }
    }
}


export class CharacterStatusModel extends StandardStatusModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.fortune = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0, min: 0}),
        });
        schema.fate = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0, min: 0}),
        });
        schema.resilience = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0, min: 0}),
        });
        schema.resolve = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0, min: 0}),
        });
        return schema;
    }

    increment(type)
    {
        return {[`system.${this.schema.fieldPath}.${type}.value`] : this[type].value + 1}
    }

    decrement(type)
    {
        return {[`system.${this.schema.fieldPath}.${type}.value`] : this[type].value - 1}
    }
}