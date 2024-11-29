import CrewTest from "../../system/crew-test";
import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class VehicleTestModel extends BaseItemModel {
    static LOCALIZATION_PREFIXES = ["WH.Models.vehicleTest"];
    static defineSchema() {
        let schema = super.defineSchema();
        schema.roles = new fields.SchemaField({
            value : new fields.StringField(),
            vital : new fields.StringField()
        });
        schema.handling = new fields.BooleanField({})
        return schema;
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