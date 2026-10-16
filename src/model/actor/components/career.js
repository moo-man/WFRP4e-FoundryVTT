import Advancement from "../../../system/advancement";

let fields = foundry.data.fields;

export class CharacterCareerModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};

        schema.path = new fields.EmbeddedDataField(DocumentReferenceModel);
        schema.tier = new fields.StringField();
        schema.history = ListModel.createListModel(new fields.SchemaField({
            path: new fields.EmbeddedDataField(DocumentReferenceModel),
            tier: new fields.StringField(),
        }));
        schema.advancements = new fields.TypedObjectField(ListModel.createListModel(new fields.SchemaField({
            type: new fields.StringField({choices: ["other", "trapping", "characteristic", "skill", "talent"]}),
            document: new fields.EmbeddedDataField(DocumentReferenceModel),
            characteristic: new fields.StringField(),
            label: new fields.StringField()
        })));

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

    clean()
    {
        return foundry.utils.mergeObject(this.cleanAdvancements(), this.cleanHistory());
    }
    // Removes any advancement trackers that don't have associated paths or tiers
    cleanAdvancements()
    {
        let fieldPath = this.schema.fields.advancements.fieldPath;
        let update = {};
        for(let key of Object.keys(this.advancements))
        {
            let [path, tier] = key.split("-");

            // Remove any malformed keys
            if (!path || !tier)
            {
                update[`${fieldPath}.${key}`] = _del;
            }
            // Remove any path or tier that doesn't exist
            else if (!this.parent.parent.items.get(path)?.system?.tiers[tier])
            {
                update[`${fieldPath}.${key}`] = _del;
            }
        }
        return update;
    }

    // Removes any career history entries that don't have an associated career path (e.g. path was deleted)
    cleanHistory()
    {
        let fieldPath = this.schema.fields.history.fieldPath;

        let toRemove = [];
        for(let [i, history] of this.history.list.entries())
        {
            if (!history.path.document || !history.path.document.system.tiers[history.tier])
            {
                toRemove.push(i);
            }
        }
        return {[fieldPath +".list"]: this.history.list.filter((_, i) => !toRemove.includes(i))};
    }

    async handleNewCareer(careerPath, tier)
    {
        let update = this.addToHistory();
        if (this.document)
        {
            let inClass = careerPath.system.class == this.path.document?.system.class;
            let xp = await ValueDialog.create({title: "Switch Career", text: "Enter XP Spent on Career change"}, inClass ? 100 : 200)

            if (isNaN(xp))
            {
                throw "Invalid XP entered, aborting Career creation"
            }
            foundry.utils.mergeObject(update, this.parent.spendExp(xp, "Switch Career: " + (tier ? careerPath.system.tiers[tier].name : careerPath.name)))
        }

        await this.parent.parent.update(update);
    }

    addToHistory()
    {
        return foundry.utils.mergeObject(this.history.add({
            path: this.path,
            tier: this.tier
        }), this.path.unset())
    }

    // Remove from history and set as current
    async reenter(path, tier)
    {
        await this.handleNewCareer(path, tier)

        let historyIndex = this.history.list.findIndex(i => i.tier == tier && i.path.id == path.id);

        let historyUpdate = {};
        if (historyIndex >= 0)
        {
            foundry.utils.mergeObject(historyUpdate, this.parent.parent.system.career.history.remove(historyIndex)); // Can't do `this.history` because it's not updated yet for some reason
        }

        // Put old career as current, remove from history
        await this.parent.parent.update(foundry.utils.mergeObject(historyUpdate, this.set(path, tier)));
    }

    get advancement()
    {
        return this.advancements[`${this.document.id}-${this.tier}`] || {list: []};
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

    get level()
    {
        return this.current.level;
    }

    get current()
    {
        let career = this.path.document;
        if (career)
        {
            return career.system.tiers[this.tier];
        }
    }

    // Because I am stubborn and insistent on the ability to add different earning skills for different tiers, things are difficult
    // If a tier specifies an earning skill, use that, if not, try the tier before it, keep going until tier 0 (returning empty array)
    get earningSkills()
    {
        return this._getEarningSkillsForTier(this.current.level);
    }

    _getEarningSkillsForTier(level)
    {
        if (!level)
        {
            return [];
        }
        let tier = this.document.system.getTier(level)
        if (tier.incomeSkill.length)
        {
            return tier.incomeSkill.map(i => tier.skills[i]);
        }
        else return this._getEarningSkillsForTier(level - 1);
    }

    handleTalentAdvancement(talent)
    {
        if (this.talents.includes(talent.name) && game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e)
        {
            this.parent.parent.update(this.addAdvancement({type: "talent", label: game.i18n.format("5e.Advancement.Talent", {talent: talent.name})}));
        }
    }

    addAdvancement(data)
    {
        return {[this.schema.fields.advancements.fieldPath + `.${this.document.id}-${this.tier}.list`]: this.advancement.list.concat(data)};
    }

    removeAdvancement(index)
    {
        return {[this.schema.fields.advancements.fieldPath + `.${this.document.id}-${this.tier}.list`]: this.advancement.list.filter((_, i) => i != index)};
    }

    async rollIncome()
    {  
        let skills = this.earningSkills.map(i => this.parent.parent.itemTypes.skill.find(sk => sk.name == i)).filter(i => i);
        let skill;
        if (skills.length == 0)
        {
          ui.notifications.error("SHEET.SkillMissingWarning", {localize: true});
          return;
        }
  
        if (skills.length == 1)
        {
          skill = skills[0];
        }
        else 
        {
          skill = (await ItemDialog.create(skills, 1, {title : "Income", text: "Choose Earning Skill to roll for Income"}))[0];
        }
  
        if (!skill)
        {
          skill = skills[0];
        }
  
        let context = {
          appendTitle: ` - ${game.i18n.localize("Income")}`,
          income: this.parent.details.status
        };
  
        this.parent.parent.setupSkill(skill, context).then(test => test.roll())
    }


    //#region Advancement


    async advanceCareer()
    {
        let nextTier = this.document.system.getTier(this.level + 1);
        let update = {};

        if (this.current.advancementsNeeded > this.current.advancement.length)
        {
            if (!(await foundry.applications.api.Dialog.confirm({window: {title: "Incomplete Career"}, content: "Not enough Advancements to advance in this Career. Continue anyway?"})))
            {
                return {};
            }
        }


        if (!nextTier)
        {
            ui.notifications.error(`Tier ${this.level + 1} not found on the Career Path!`);
            return {};
        }
        else 
        {
            let xp = await ValueDialog.create({title: "Advance Career", text: "Enter XP Spent on Career Advancement"}, 100);
            
            foundry.utils.mergeObject(update, this.parent.spendExp(xp, `Advance Career: ${this.current.name} → ${nextTier.name}`));
        }
        foundry.utils.mergeObject(update, this.addToHistory());
        return foundry.utils.mergeObject(update, this.set(this.document, nextTier));
    }

    advanceCharacteristic(characteristic, amount, {direction=1}={})
    {
        // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
        let actor = this.parent.parent;
        let system = actor.system.toObject();
        let current = actor.system.characteristics[characteristic];  

        if (direction == 1)
        {
            let cost = Advancement.calculateAdvRangeCost(current.advances, current.advances + amount, "characteristic", current.costModifier);
            Advancement.checkValidAdvancement(system.details.experience.total, system.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), game.wfrp4e.config.characteristics[characteristic]);
            system.characteristics[characteristic].advances += amount;
            system.details.experience.spent = Number(system.details.experience.spent) + cost;

            let expLog = actor.system.addToExpLog(cost, game.wfrp4e.config.characteristics[characteristic], system.details.experience.spent);
            ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason : game.wfrp4e.config.characteristics[characteristic]}));
            system.details.experience.log = expLog;

            
            if (game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e)
            {
                foundry.utils.mergeObject(system, foundry.utils.expandObject(this.addAdvancement({
                    type: "characteristic", 
                    characteristic,
                    label: game.i18n.format("5e.Advancement.Characteristic", {characteristic: game.wfrp4e.config.characteristics[characteristic], value: `${current.advances} → ${system.characteristics[characteristic].advances}`})
                })).system);
            }
        }
        else if (direction == -1)
        {
            // Calculate the advancement cost based on advances -1, add that amount back into exp
            if (current.advances == 0)
                return;
            let cost = -1 * Advancement.calculateAdvRangeCost(current.advances, Math.max(0, current.advances - 5), "characteristic", current.costModifier);
    
            system.characteristics[characteristic].advances -= amount;
            system.details.experience.spent = Number(system.details.experience.spent) - cost;
    
            let expLog = actor.system.addToExpLog(-1 * cost, game.wfrp4e.config.characteristics[characteristic], system.details.experience.spent);
            ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : game.wfrp4e.config.characteristics[characteristic]}));
            system.details.experience.log = expLog;
        }

        actor.update({system}, {skipExperienceChecks : true});
    }

    advanceSkill(skill, amount, {direction=1}={})
    {
        let actor = this.parent.parent;
        let system = actor.system.toObject();
        let update = {
            items: []
        }
        
        if (direction == 1) {
        // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
        let cost = Advancement.calculateAdvRangeCost(skill.system.advances.value, skill.system.advances.value + amount, "skill", skill.system.advances.costModifier)
        try 
        {
            Advancement.checkValidAdvancement(system.details.experience.total, system.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), skill.name);
            system.details.experience.spent = Number(system.details.experience.spent) + cost;
            update.items.push({_id : skill.id, "system.advances.value" : skill.system.advances.value + amount})

            system.details.experience.log = actor.system.addToExpLog(cost, skill.name, system.details.experience.spent)
            ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason: skill.name}))

            if (game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e)
            {
                    foundry.utils.mergeObject(system, foundry.utils.expandObject(this.addAdvancement({
                        type: "skill", 
                        document: {id: skill.id, name: skill.name, uuid: skill.uuid},
                        label: game.i18n.format("5e.Advancement.Skill", {skill: skill.name, value: `${skill.system.advances.value} → ${skill.system.advances.value + 5}`})
                })).system);
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
            let cost = -1 * Advancement.calculateAdvRangeCost(skill.system.advances.value, Math.max(0, skill.system.advances.value - amount), "skill", skill.system.advances.costModifier)
            system.details.experience.spent = Number(system.details.experience.spent) - cost;
            update.items.push({_id : skill.id, "system.advances.value" : Math.max(0, skill.system.advances.value - amount)})

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