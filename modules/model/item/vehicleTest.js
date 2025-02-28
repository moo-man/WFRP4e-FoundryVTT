import CrewTest from "../../system/crew-test";
import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class VehicleTestModel extends BaseItemModel {
    static LOCALIZATION_PREFIXES = ["WH.Models.vehicleTest"];

    static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
        isVehicle: true
    }, {inplace: false}));

    static defineSchema() {
        let schema = super.defineSchema();
        schema.roles = new fields.SchemaField({
            value : new fields.StringField(),
            vital : new fields.StringField()
        });
        schema.handling = new fields.BooleanField({})
        return schema;
    }

    static get compendiumBrowserFilters() {
        return new Map([
            ...Array.from(super.compendiumBrowserFilters),
            ["handling", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.handling.label",
                type: "boolean",
                config: {
                    keyPath: "system.handling"
                }
            }],
            ["rolesValue", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.roles.value.label",
                type: "text",
                config: {
                    multiple: true,
                    keyPath: "system.roles.value"
                }
            }],
            ["rolesVital", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.roles.vital.label",
                type: "text",
                config: {
                    keyPath: "system.roles.vital"
                }
            }]
        ]);
    }

    /**
     * Used to identify an Item as one being a child or instance of VehicleTestModel
     *
     * @final
     * @returns {boolean}
     */
    get isVehicleTest() {
        return true;
    }

    roll()
    {
        let crewTest = new CrewTest(this.parent);
        crewTest.renderChatPrompt();
    }
}