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
          clickAdvancement: this._onClickAdvancement,
          advanceCareer: this._onAdvanceCareer,
          addUntrainedSkill : this._onAddUntrainedSkill,
          clickUntrainedTalent : {buttons: [0, 2], handler : this._onClickUntrainedTalent},
          rollIncome : this._onRollIncome,
          changeCareer : this._onChangeCareer,
          onRest : this._onRest,
          deleteExp : this._onDeleteExp,
          toggleOwnedTrapping : this._onToggleTrapping
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
        context.career = this._prepareCareerContext();

        return context;
      }

      _prepareCareerContext()
      {
        let careerContext = {};
        const createAdvancementTrack = (tier, advancements) => 
          {
            let adv = {}
            if (!tier || !advancements)
            {
              return adv;
            }
  
            if (advancements.length > tier.advancementsNeeded)
            {
              adv.track = advancements.slice(0, tier.advancementsNeeded);
              adv.overflow = advancements.slice(tier.advancementsNeeded);
            }
            else 
            {
              adv.track = advancements.concat(Array(tier.advancementsNeeded - advancements.length).fill(null));
            }
            return adv;
          }
  
          careerContext.advancement = createAdvancementTrack(this.document.system.career.current, this.document.system.career.current?.advancement);
          if (this.document.system.career.history.list.length)
            {
              careerContext.history = this.document.system.career.history.list.toReversed().filter(i => i.path.document).map(i => {
              return {
                career: i.path.document,
                tier: i.path.document.system.tiers[i.tier],
                advancement: createAdvancementTrack(i.path.document.system.tiers[i.tier], i.path.document.system.tiers[i.tier].advancement)
              }
            })
          }

          return careerContext;
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

    static async _onClickAdvancement(ev, target)
    {
      let index = this._getIndex(ev, target);
      let advancement = this.document.system.career.advancement.list[index]
      if (advancement)
      {
        if (await foundry.applications.api.Dialog.confirm({
          content: `<p>Remove Advancement: "${advancement.label}"?</p><p> <strong>Note</strong>: This will not undo the advancement itself, only its association with the career.`, 
          window: {title: "Remove Advancement"}
        }))
        {
          this.document.update(this.document.system.career.removeAdvancement(index));
        }
      }
      else 
      {
        let label = await ValueDialog.create({text: "Enter Advancement Label", title: "Add Advancement"});
        this.document.update(this.document.system.career.addAdvancement({label : label || "(No Label)", type: "other"}))
      }
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
      else 
      {
        this.actor.system.career.addTalent(talent)
      }
    }

    static async _onAdvanceCareer(ev)
    {
      this.actor.update(await this.actor.system.career.advanceCareer());
    }

    static _onChangeCareer(ev)
    {
      new CareerSelector(this.document).render(true);
    }

    static _onToggleTrapping(ev, target)
    {
      let career = this._getDocument(ev)
      let trappingIndex = Number(target.dataset.index);

      // If trapping not owned, set to owned, otherwise remove flag
      // This cannot unselect a trapping *actually* owned by the actor
      if (career.system.trappingsOwned.includes(trappingIndex))
      {
        career.update({"system.trappingsOwned" : career.system.trappingsOwned.filter(i => i != trappingIndex)})
      }
      else 
      {
        career.update({"system.trappingsOwned" : career.system.trappingsOwned.concat(trappingIndex)})
      }
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

      if (career.type == "careerPath")
      {
        this.actor.system.career.rollIncome();
        return;
      }


      if (career.system.requiredTrappingStatus.length && career.system.requiredTrappingStatus.some(t => !t.owned))
      {
        ui.notifications.error("SHEET.RequiredTrappingsError", {localize: true})
        return;
      }

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
      // Prevent clicking until update (which refreshes the sheet) or error (rerender handled manually)
      ev.target.style.pointerEvents = "none"

      try 
      {
        await this.actor.system.career.advanceCharacteristic(ev.target.dataset.characteristic, game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e ? 5 : 1, {direction: -1 * (ev.button - 1)}); // button == 0 turns into 1, button == 2 turns into -1
      } 
      catch(error) 
      {
          ui.notifications.error(error);
          this.render({force: true});
      }
      finally
      {
        this.render({force: true});
      }
    }

    static async _onAdvanceSkill(ev)
    {
      ev.stopPropagation();
      let skill = this._getDocument(ev);
      if(!skill)
      {
        return;
      }

      // Prevent clicking until update (which refreshes the sheet) or error (rerender handled manually)
      ev.target.style.pointerEvents = "none"
      try 
      {
        await this.actor.system.career.advanceSkill(skill, game.settings.get("wfrp4e", "editionSettings").careerAdvancement5e ? 5 : 1, {direction: -1 * (ev.button - 1)}); // button == 0 turns into 1, button == 2 turns into -1
      } 
      catch(error) 
      {
          ui.notifications.error(error);
          this.render({force: true});
      }
      finally
      {
        this.render({force: true});
      }
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