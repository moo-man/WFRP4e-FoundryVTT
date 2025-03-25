import { ManannMoodModel } from "./mood";
import { MoraleModel } from "./morale";

let fields = foundry.data.fields;

export class VehicleStatusModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.wounds = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField(),
        });
        schema.criticalWounds = new fields.SchemaField({
            value: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField(),
        });
        schema.carries = new fields.SchemaField({
            current: new fields.NumberField({ initial: 0 }),
            max: new fields.NumberField({ initial: 10 }),
        });
        schema.encumbrance = new fields.SchemaField({
            current: new fields.NumberField({ initial: 0 }),
            initial: new fields.NumberField({ initial: 0 }),
        });
        schema.morale = new fields.EmbeddedDataField(MoraleModel);
        schema.mood = new fields.EmbeddedDataField(ManannMoodModel);
        return schema;
    }

    static get compendiumBrowserVehicleStatusFilters() {
        return new Map([
            ["carries", {
                label: "Carries",
                type: "range",
                config: {
                    keyPath: "system.status.carries.max"
                }
            }],
            ["encumbrance", {
                label: "Encumbrance",
                type: "range",
                config: {
                    keyPath: "system.status.encumbrance.current"
                }
            }],
        ]);
    }

    initializeArmour()
    {
        this.ward = {value: null}
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

}