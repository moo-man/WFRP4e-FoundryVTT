import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class CareerModel extends BaseItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.skill = new fields.StringField();
        schema.advances = new fields.NumberField({min: 0, initial: 0});
        schema.restricted = new fields.BooleanField();
        return schema;
    }


    createChecks()
    {
        if (this.parent.actor?.type == "creature") 
        {
            this.parent.actor.advanceNPC(this.parent);
        }
    }


     changeSkillName(oldName, newName) {
        let careerSkills = duplicate(this.skills)

        // If career has the skill, change the name
        if (careerSkills.includes(oldName)) 
        {
            careerSkills[careerSkills.indexOf(oldName)] = newName
        }
        else // if it doesn't, return
        {
            return;
        }

        // Ask the user to confirm the change
        new Dialog({
            title: game.i18n.localize("SHEET.CareerSkill"),
            content: `<p>${game.i18n.localize("SHEET.CareerSkillPrompt")}</p>`,
            buttons: {
                yes: {
                    label: game.i18n.localize("Yes"),
                    callback: async dlg => {
                        ui.notifications.notify(`${game.i18n.format("SHEET.CareerSkillNotif", { oldName, newName, career: currentCareer.name })}`)
                        this.parent.update({ "system.skills": careerSkills })
                    }
                },
                no: {
                    label: game.i18n.localize("No"),
                    callback: async dlg => {
                        return;
                    }
                },
            },
            default: 'yes'
        }).render(true);
    }

}