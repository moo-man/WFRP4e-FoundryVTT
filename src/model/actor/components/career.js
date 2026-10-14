import Advancement from "../../../system/advancement";

let fields = foundry.data.fields;

export class CharacterCareerModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};

        schema.path = new fields.EmbeddedDataField(DocumentReferenceModel);
        schema.tier = new fields.StringField();
        schema.history = ListModel.createListModel(new fields.SchemaField({

        }));
        schema.advancement = ListModel.createListModel(new fields.SchemaField({
            type: new fields.StringField({choices: ["other", "trapping", "characteristic", "skill", "talent"]}),
            document: new fields.EmbeddedDataField(DocumentReferenceModel),
            characteristic: new fields.StringField(),
            label: new fields.StringField()
        }));

        return schema;
    }

    _addModelProperties()
    {
        this.path.relative = this.parent.actor.items;
    }

    set(path, tier)
    {
        tier = path.system.getTier(tier).id;

        return foundry.utils.mergeObject(this.path.set(path), {[this.schema.fields.tier.fieldPath]: tier});
    }

    get characteristics()
    {
        return this.current?.availableCharacteristics || [];
    }

    get skills()
    {
        return this.current?.availableSkills || [];
    }

    get talents()
    {
        return this.current?.availableTalents || [];
    }

    get document()
    {
        return this.path.document;
    }

    get current()
    {
        let career = this.path.document;
        if (career)
        {
            return career.system.tiers[this.tier];
        }
    }



    handleTalentAdvancement(talent)
    {
        if (this.talents.includes(talent.name) && game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e)
        {
            this.parent.parent.update(this.advancement.add({type: "talent", label: game.i18n.format("5e.Advancement.Talent", {talent: talent.name})}));
        }
    }


    //#region Advancement
    advanceCharacteristic(characteristic, {direction=1}={})
    {
        // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
        let actor = this.parent.parent;
        let system = actor.system.toObject();
        let current = actor.system.characteristics[characteristic];  

        if (direction == 1)
        {
            let cost = Advancement.calculateAdvCost(current.advances, "characteristic", current.costModifier);
            Advancement.checkValidAdvancement(system.details.experience.total, system.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), game.wfrp4e.config.characteristics[characteristic]);
            system.characteristics[characteristic].advances++;
            system.details.experience.spent = Number(system.details.experience.spent) + cost;

            let expLog = actor.system.addToExpLog(cost, game.wfrp4e.config.characteristics[characteristic], system.details.experience.spent);
            ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason : game.wfrp4e.config.characteristics[characteristic]}));
            system.details.experience.log = expLog;

            
            if (game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e)
            {
                system.career.advancement.list = this.advancement.list.concat({
                    type: "characteristic", 
                    characteristic,
                    label: game.i18n.format("5e.Advancement.Characteristic", {characteristic: game.wfrp4e.config.characteristics[characteristic], value: system.characteristics[characteristic].advances})
                })
            }
        }
        else if (direction == -1)
        {
            // Calculate the advancement cost based on advances -1, add that amount back into exp
            if (current.advances == 0)
                return;
            let cost = Advancement.calculateAdvCost(current.advances - 1, "characteristic", current.costModifier);
    
            system.characteristics[characteristic].advances--;
            system.details.experience.spent = Number(system.details.experience.spent) - cost;
    
            let expLog = actor.system.addToExpLog(-1 * cost, game.wfrp4e.config.characteristics[characteristic], system.details.experience.spent);
            ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : game.wfrp4e.config.characteristics[characteristic]}));
            system.details.experience.log = expLog;
        }

          actor.update({system}, {skipExperienceChecks : true});
    }

    advanceSkill(skill, {direction=1}={})
    {
        let actor = this.parent.parent;
        let system = actor.system.toObject();
        let update = {
            items: []
        }
        
        if (direction == 1) {
        // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
        let cost = Advancement.calculateAdvCost(skill.system.advances.value, "skill", skill.system.advances.costModifier)
        try 
        {
            Advancement.checkValidAdvancement(system.details.experience.total, system.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), skill.name);
            system.details.experience.spent = Number(system.details.experience.spent) + cost;
            update.items.push({_id : skill.id, "system.advances.value" : skill.system.advances.value + 1})

            system.details.experience.log = actor.system.addToExpLog(cost, skill.name, system.details.experience.spent)
            ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason: skill.name}))

            if (game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e)
            {
                system.career.advancement.list = this.advancement.list.concat({
                    type: "skill", 
                    document: {id: skill.id, name: skill.name, uuid: skill.uuid},
                    label: game.i18n.format("5e.Advancement.Skill", {skill: skill.name, value: skill.system.advances.value})
                })
            }

            update.system = system;
        } 
        catch(error) 
        {
            ui.notifications.error(error);
        }
        }
        else if (direction == -1) {
            // Do the reverse, calculate the advancement cost (after subtracting 1 advancement), add that exp back
            if (skill.system.advances.value == 0)
                return;
            let cost = Advancement.calculateAdvCost(skill.system.advances.value - 1, "skill", skill.system.advances.costModifier)
            system.details.experience.spent = Number(system.details.experience.spent) - cost;
            update.items.push({_id : skill.id, "system.advances.value" : skill.system.advances.value - 1})

            system.details.experience.log = actor.system.addToExpLog(-1 * cost, skill.name, system.details.experience.spent)
            ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : skill.name}))
            update.system = system;
        }

        actor.update(update, {skipExperienceChecks : true});
    }

    addTalent(talent)
    {
        let actor = this.parent.parent;

        // 5e: no need to handle adding to advancement log because that's handled on Talent item creation
        try {
            new foundry.applications.api.DialogV2(
              {
                window : {title: game.i18n.localize("SHEET.AddTalentTitle")},
                content: `<p>${game.i18n.localize("SHEET.AddTalentPrompt")}</p>`,
                buttons:
                [
                  {
                    action: "yes",
                    label: game.i18n.localize("Yes"),
                    default: true,
                    callback: dlg => {
                      try {
                        Advancement.checkValidAdvancement(actor.details.experience.total, actor.details.experience.spent + 100, game.i18n.localize("ACTOR.ErrorAdd"), talent.name);
                        actor.createEmbeddedDocuments("Item", [talent.toObject()]);
                        let expLog = foundry.utils.duplicate(actor.details.experience.log || []) 
                        expLog.push({amount : 100, reason : talent.name, spent : actor.details.experience.spent + 100, total : actor.details.experience.total, type : "spent"})
                        ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : 100, reason : talent.name}))
                        actor.update( // Subtract experience if added
                          {
                            "system.details.experience.spent": actor.details.experience.spent + 100,
                            "system.details.experience.log": expLog
                          })
                      } catch(error) {
                        ui.notifications.error(error);
                      }
                    }
                  },
                  {
                    action: "yesNoExp",
                    label: game.i18n.localize("Free"),
                    callback: dlg => { actor.createEmbeddedDocuments("Item", [talent.toObject()]); }
                  },
                  {
                    action: "cancel",
                    label: game.i18n.localize("Cancel"),
                    callback: dlg => { return }
                  },
                ],
              }).render(true);
          }
          catch
          {
            console.error(error)
            ui.notifications(error)
          }
    }

    //#endregion

}