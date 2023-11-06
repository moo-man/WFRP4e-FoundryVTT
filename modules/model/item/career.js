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
    

    expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);
        data.properties = [];
        data.properties.push(`<b>${game.i18n.localize("Class")}</b>: ${this.class.value}`);
        data.properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.careergroup.value}`);
        data.properties.push(game.wfrp4e.config.statusTiers[this.status.tier] + " " + this.status.standing);
        data.properties.push(`<b>${game.i18n.localize("Characteristics")}</b>: ${this.characteristics.map(i => i = " " + game.wfrp4e.config.characteristicsAbbrev[i])}`);
        data.properties.push(`<b>${game.i18n.localize("Skills")}</b>: ${this.skills.map(i => i = " " + i)}`);
        data.properties.push(`<b>${game.i18n.localize("Talents")}</b>: ${this.talents.map(i => i = " " + i)}`);
        data.properties.push(`<b>${game.i18n.localize("Trappings")}</b>: ${this.trappings.map(i => i = " " + i)}`);
        data.properties.push(`<b>${game.i18n.localize("Income")}</b>: ${this.incomeSkill.map(i => ` <a class = 'career-income' data-career-id=${this.id}> ${this.skills[i]} <i class="fas fa-coins"></i></a>`)}`);
        // When expansion data is called, a listener is added for 'career-income'
        return data;
      }

      chatData() {
        let properties = [];
        properties.push(`<b>${game.i18n.localize("Class")}</b>: ${this.class.value}`);
        properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.careergroup.value}`);
        properties.push(`<b>${game.i18n.localize("Status")}</b>: ${game.wfrp4e.config.statusTiers[this.status.tier] + " " + this.status.standing}`);
        properties.push(`<b>${game.i18n.localize("Characteristics")}</b>: ${this.characteristics.map(i => i = " " + game.wfrp4e.config.characteristicsAbbrev[i])}`);
        properties.push(`<b>${game.i18n.localize("Skills")}</b>: ${this.skills.map(i => i = " " + "<a class = 'skill-lookup'>" + i + "</a>")}`);
        properties.push(`<b>${game.i18n.localize("Talents")}</b>: ${this.talents.map(i => i = " " + "<a class = 'talent-lookup'>" + i + "</a>")}`);
        properties.push(`<b>${game.i18n.localize("Trappings")}</b>: ${this.trappings.map(i => i = " " + i)}`);
        properties.push(`<b>${game.i18n.localize("Income")}</b>: ${this.incomeSkill.map(i => " " + this.skills[i])}`);
        return properties;
      }
}