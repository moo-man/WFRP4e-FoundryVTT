import CareerSelector from "../../apps/career-selector";
import Advancement from "../../system/advancement";
import WFRP_Utility from "../../system/utility-wfrp4e";
import StandardWFRP4eActorSheet from "./standard-sheet";

export default class ActorSheetWFRP4eCharacter extends StandardWFRP4eActorSheet
{
    static DEFAULT_OPTIONS = {
        classes: ["character"],
        actions: {
          advanceCharacteristic : {buttons: [0, 2], handler : this._onAdvanceCharacteristic},
          advanceSkill : {buttons: [0, 2], handler : this._onAdvanceSkill},
          advanceTalent : {buttons: [0, 2], handler : this._onAdvanceTalent},
          addUntrainedSkill : this._onAddUntrainedSkill,
          clickUntrainedTalent : {buttons: [0, 2], handler : this._onClickUntrainedTalent},
          rollIncome : this._onRollIncome,
          changeCareer : this._onChangeCareer,
          onRest : this._onRest,
          deleteExp : this._onDeleteExp
        },
        window : {
          resizable : true
        },
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/actor/character/character-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/actor-tabs.hbs' },
        main: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/character/character-main.hbs' },
        skills: { scrollable: ["", ".basic .list-content", ".advanced .list-content"], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-skills.hbs' },
        talents: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-talents.hbs' },
        combat: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-combat.hbs' },
        effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-effects.hbs' },
        magic: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-magic.hbs' },
        religion: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-religion.hbs' },
        trappings: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-inventory.hbs' },
        notes: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/character/character-notes.hbs' },
      }
      
      async _prepareContext(options)
      {
        let context = await super._prepareContext(options);
        context.experienceLog = this._condenseXPLog()
        context.nonTrivialCriticals = context.items.critical.filter(c => Number.isNumeric(c.system.wounds.value))
        context.canEditExperience = game.user.isGM || game.settings.get("wfrp4e", "playerExperienceEditing")
  
        return context;
      }
    
    _condenseXPLog() {
      let condensed= []
      for (
        let logIndex = 0, lastPushed, lastPushedCounter = 0;
        logIndex < this.document.details.experience.log.length;
        logIndex++) {
        let condense = false;
        if ( // If last pushed exists, and is the same, type, same reason, and both are positiev or both are negative
          lastPushed &&
          lastPushed.type == this.document.details.experience.log[logIndex].type &&
          lastPushed.reason == this.document.details.experience.log[logIndex].reason &&
          ((lastPushed.amount >= 0 && this.document.details.experience.log[logIndex].amount >= 0)
            || (lastPushed.amount <= 0 && this.document.details.experience.log[logIndex].amount <= 0))) { condense = true; }
  
        if (condense) {
          lastPushed[lastPushed.type] = this.document.details.experience.log[logIndex][lastPushed.type]
          lastPushed.amount += this.document.details.experience.log[logIndex].amount
          lastPushed.index = logIndex // If condensed entry, keep the "latest" log index so when a condensed entry is deleted, it deletes from the latest
          lastPushed.spent = this.document.details.experience.log[logIndex].spent
          lastPushed.total = this.document.details.experience.log[logIndex].total
          lastPushed.counter++
        }
        else {
          lastPushed = foundry.utils.duplicate(this.document.details.experience.log[logIndex]);
          lastPushed.index = logIndex
          lastPushed.counter = 1;
          condensed.push(lastPushed)
          lastPushedCounter = 0;
  
        }
      }
      for (let log of condensed) {
        if (log.counter && log.counter > 1)
          log.reason += ` (${log.counter})`
      }
      return condensed.reverse()
    }

    static async _onAddUntrainedSkill(ev)
    {
      let skill = await WFRP_Utility.findSkill(ev.target.text);

      // Right click - show sheet
      if (ev.button == 2) {
        skill.sheet.render(true);
      }
      else {
        try {
          if (await foundry.applications.api.DialogV2.confirm({ window : {title: game.i18n.localize("SHEET.AddSkillTitle")}, content: `<p>${game.i18n.localize("SHEET.AddSkillPrompt")}</p>`}))
          {
            this.actor.createEmbeddedDocuments("Item", [skill], {career : true});
          }
        }
        catch
        {
          console.error(error)
          ui.notifications.error(error)
        }
      }
    }

    static async _onClickUntrainedTalent(ev)
    {
      let talent = await WFRP_Utility.findTalent(ev.target.text);

      // Right click - show sheet
      if (ev.button == 2) 
      {
        talent.sheet.render(true);
      }
  
      else {
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
                      Advancement.checkValidAdvancement(this.actor.details.experience.total, this.actor.details.experience.spent + 100, game.i18n.localize("ACTOR.ErrorAdd"), talent.name);
                      this.actor.createEmbeddedDocuments("Item", [talent.toObject()]);
                      let expLog = foundry.utils.duplicate(this.actor.details.experience.log || []) 
                      expLog.push({amount : 100, reason : talent.name, spent : this.actor.details.experience.spent + 100, total : this.actor.details.experience.total, type : "spent"})
                      ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : 100, reason : talent.name}))
                      this.actor.update( // Subtract experience if added
                        {
                          "system.details.experience.spent": this.actor.details.experience.spent + 100,
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
                  callback: dlg => { this.actor.createEmbeddedDocuments("Item", [talent.toObject()]); }
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
    }

    static _onChangeCareer(ev)
    {
      new CareerSelector(this.document).render(true);
    }

    static async _onRest(ev) {
      let skill = this.actor.itemTags.skill.find(s => s.name == game.i18n.localize("NAME.Endurance"));
      let options = {rest: true, tb: this.actor.characteristics.t.bonus, skipTargets: true}
      let test;
      if (skill)
      {
        test = await this.actor.setupSkill(skill, options);
      }
      else 
      {
        test = await this.actor.setupCharacteristic("t", options);
      }
      test.roll();
    }


    static async _onRollIncome(ev)
    {
      let career = this._getDocument(ev)
      let skills = career.system.incomeSkill.map(i => career.system.skills[i]).map(i => this.actor.itemTypes.skill.find(sk => sk.name == i)).filter(i => i);
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
        skill = (await ItemDialog.create(skill, 1, {title : "Choose Skill"}))[0];
      }

      if (!skill)
      {
        skill = skills[0];
      }

      let options = {
        title: `${skill.name} - ${game.i18n.localize("Income")}`, 
        income: this.actor.details.status, 
        career: career.toObject()
      };

      this.actor.setupSkill(skill, options).then(test => test.roll())
    }

    static async _onAdvanceCharacteristic(ev)
    {
      // Prevent clicking until update (which refreshes the sheet)
      ev.target.style.pointerEvents = "none"
      let characteristic = ev.target.dataset.characteristic;
      let current = this.actor.system.characteristics[characteristic];
      let system = this.actor.system.toObject()

      if (ev.button == 0) 
      {
        // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
        let cost = Advancement.calculateAdvCost(current.advances, "characteristic");
        try 
        {
          Advancement.checkValidAdvancement(system.details.experience.total, system.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), game.wfrp4e.config.characteristics[characteristic]);
          system.characteristics[characteristic].advances++;
          system.details.experience.spent = Number(system.details.experience.spent) + cost;

          let expLog = this.actor.system.addToExpLog(cost, game.wfrp4e.config.characteristics[characteristic], system.details.experience.spent)
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason : game.wfrp4e.config.characteristics[characteristic]}))
          system.details.experience.log = expLog
        } 
        catch(error) 
        {
          ui.notifications.error(error);
          this.render(true); // Refresh sheet to allow clicking again
        }
      }
      else if (ev.button == 2) 
      {
        // Calculate the advancement cost based on advances -1, add that amount back into exp
        if (current.advances == 0)
          return this.render(true); // Rerender to allow clicking again
        let cost = Advancement.calculateAdvCost(current.advances - 1, "characteristic");

        system.characteristics[characteristic].advances--;
        system.details.experience.spent = Number(system.details.experience.spent) - cost;

        let expLog = this.actor.system.addToExpLog(-1 * cost, game.wfrp4e.config.characteristics[characteristic], system.details.experience.spent)
        ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : game.wfrp4e.config.characteristics[characteristic]}))
        system.details.experience.log = expLog
      }
      
      this.actor.update({system}, {skipExperienceChecks : true});
    }

    static _onAdvanceSkill(ev)
    {
      ev.stopPropagation();
      let skill = this._getDocument(ev);
      let system = this.actor.system.toObject()
      let update = {items : []}
      if(!skill)
      {
        return;
      }
      ev.target.style.pointerEvents = "none"

      if (ev.button == 0) {
        // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
        let cost = Advancement.calculateAdvCost(skill.system.advances.value, "skill", skill.system.advances.costModifier)
        try 
        {
          Advancement.checkValidAdvancement(system.details.experience.total, system.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), skill.name);
          system.details.experience.spent = Number(system.details.experience.spent) + cost;
          update.items.push({_id : skill.id, "system.advances.value" : skill.system.advances.value + 1})

          system.details.experience.log = this.actor.system.addToExpLog(cost, skill.name, system.details.experience.spent)
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason: skill.name}))
          update.system = system;
        } 
        catch(error) 
        {
          ui.notifications.error(error);
        }
      }
      else if (ev.button == 2) {
        // Do the reverse, calculate the advancement cost (after subtracting 1 advancement), add that exp back
        if (skill.system.advances.value == 0)
            return this.render(true); // Rerender to allow clicking again
        let cost = Advancement.calculateAdvCost(skill.system.advances.value - 1, "skill", skill.system.advances.costModifier)
        system.details.experience.spent = Number(system.details.experience.spent) - cost;
        update.items.push({_id : skill.id, "system.advances.value" : skill.system.advances.value - 1})

        system.details.experience.log = this.actor.system.addToExpLog(-1 * cost, skill.name, system.details.experience.spent)
        ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : skill.name}))
        update.system = system;
      }

      this.actor.update(update, {skipExperienceChecks : true});
    }


    static async _onAdvanceTalent(ev) 
    {

      let talent = this._getDocument(ev);
      let advances = talent.system.Advances;

      if(!talent)
      {
        return;
      }

      if (ev.button == 0) {
        // All career talents are stored in flags, retrieve the one clicked - use to calculate exp
        let spent = 0;
        let cost = (advances + 1) * 100
        try {
          Advancement.checkValidAdvancement(this.actor.details.experience.total, this.actor.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), talent.name);
          if (advances < talent.system.Max || talent.system.Max == "-") {
            spent = this.actor.details.experience.spent + cost
          }
          else
            return
          
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", { amount: cost, reason: talent.name }))
          let expLog = this.actor.system.addToExpLog(cost, talent.name, spent)
          await this.actor.update({ "system.details.experience.spent": spent, "system.details.experience.log": expLog })
          await this.actor.createEmbeddedDocuments("Item", [talent.toObject()])
        } catch (error) {
          ui.notifications.error(error);
        }
      }
      // If right click, ask to refund EXP or not
      else if (ev.button == 2) {
        let spent = 0;
        let cost = (advances) * 100
        spent = this.actor.details.experience.spent - cost

        new foundry.applications.api.DialogV2(
          {
            window : {title: game.i18n.localize("SHEET.RefundXPTitle")},
            content: `<p>${game.i18n.localize("SHEET.RefundXPPrompt")} (${(advances) * 100})</p>`,
            buttons:
            {
              yes:
              {
                action : "yes",
                default: true,
                label: game.i18n.localize("Yes"),
                callback: async dlg => {
                  let expLog = this.actor.system.addToExpLog(-1 * cost, talent.name, spent)
                  ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", { amount: -1 * cost, reason: talent.name }))
                  await this.actor.update({ "system.details.experience.spent": spent, "system.details.experience.log": expLog })
                  await talent.delete();
                }
              },
              no:
              {
                action : "no",
                label: game.i18n.localize("No"),
                callback: async dlg => {
                  await talent.delete();
                },
              },
              cancel:
              {
                action : "cancel",
                label: game.i18n.localize("Cancel"),
                callback: dlg => { return }
              }
            },
          }).render(true);
      }


  }

  static _onDeleteExp(ev) {
    let index = this._getIndex(ev);
    let experience = foundry.utils.duplicate(this.actor.system.details.experience)
    let entry = experience.log[index];
    let exp = parseInt(entry.amount);
    let type = entry.type;
    experience.log.splice(index, 1)

    foundry.applications.api.DialogV2.confirm({
      window : {title: game.i18n.localize("RevertExperience")}, 
      content: `<p>${game.i18n.localize("DIALOG.RevertExperience")}</p>`,
      yes: {
        callback: () => {
          experience[type] -= exp
          this.actor.update({ "system.details.experience": experience })
        }
      },
      no: {
        callback: () => {
          this.actor.update({ "system.details.experience": experience })
        }
      }
    })
  }

}