import ItemDialog from "../../apps/item-dialog";
import { BaseItemModel } from "./components/base";

let fields = foundry.data.fields;

export class VehicleRoleModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.test = new fields.StringField();
        return schema;
    }

    isVitalFor(test) {
        return test.system.roles.vital.split(",").map(i => i.trim()).includes(this.parent.name);
    }

    async roll(actor, options={})
    {
        let skill = await this.chooseSkill(actor);
        if (skill)
        {
          let test = await actor.setupSkill(skill.name, mergeObject({appendTitle : ` - ${this.parent.name}`, roleId : this.parent.id}, options));
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
            return ui.notifications.error("This Actor has no Skill that can be used with this Role")
        }

        if (choices.length == 1)
        {
            return skills[0];
        }

        else 
        {
            return (await ItemDialog.create(skills, 1, "Choose the Skill to use"))[0];
        }
    }
}