import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class VehicleRoleModel extends BaseItemModel {
    static LOCALIZATION_PREFIXES = ["WH.Models.vehicleRole"];

    static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
        isVehicle: true
    }, {inplace: false}));

    static defineSchema() {
        let schema = super.defineSchema();
        schema.test = new fields.StringField();
        return schema;
    }

    static get compendiumBrowserFilters() {
        return new Map([
            ...Array.from(super.compendiumBrowserFilters),
            ["test", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.test.label",
                type: "text",
                config: {
                    keyPath: "system.test"
                }
            }]
        ]);
    }

    /**
     * Used to identify an Item as one being a child or instance of VehicleRoleModel
     *
     * @final
     * @returns {boolean}
     */
    get isVehicleRole() {
        return true;
    }

    isVitalFor(test) {
        return test.system.roles.vital.split(",").map(i => i.trim()).includes(this.parent.name);
    }

    async roll(actor, options={})
    {
        let skill = await this.chooseSkill(actor);
        if (skill)
        {
          let test = await actor.setupSkill(skill.name, foundry.utils.mergeObject({appendTitle : ` - ${this.parent.name}`, roleId : this.parent.id}, options));
          test.roll();
        }
    }

    async chooseSkill(actor)
    {
        let choices = this.test.split(",").map(i => i.trim());
        let skills = [];
        for(let choice of choices)
        {
            skills = skills.concat(actor.itemTypes.skill.filter(s => s.name.includes(choice)));
        }
        
        if (skills.length == 0)
        {
            return ui.notifications.error(game.i18n.localize("VEHICLE.NoSkill"))
        }

        if (choices.length == 1)
        {
            return skills[0];
        }

        else 
        {
            return (await ItemDialog.create(skills, 1, game.i18n.localize("VEHICLE.ChooseSkill")))[0];
        }
    }
}