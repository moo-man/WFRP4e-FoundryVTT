import Advancement from "../../../../modules/system/advancement";
import StandardWFRP4eActorSheet from "./standard-sheet";

export default class CharacterWFRP4eSheet extends StandardWFRP4eActorSheet
{
    static DEFAULT_OPTIONS = {
        classes: ["character"],
        actions: {
          metaClick : {buttons: [0, 2], handler : this._onMetaClick},
          advanceCharacteristic : {buttons: [0, 2], handler : this._onAdvanceCharacteristic},
          rollIncome : this._onRollIncome
        },
        window : {
          resizable : true
        },
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/actor/character/character-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/actor-tabs.hbs' },
        main: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/character/character-main.hbs' },
        skills: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-skills.hbs' },
        talents: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-talents.hbs' },
        combat: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-combat.hbs' },
        effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-effects.hbs' },
        trappings: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-inventory.hbs' },
        notes: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/character/character-notes.hbs' },
      }
      
      async _prepareContext(options)
      {
        let context = await super._prepareContext(options);
        context.experienceLog = this._condenseXPLog()
        context.nonTrivialCriticals = context.items.critical.filter(c => Number.isNumeric(c.system.wounds.value))
    
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
          lastPushed.index = this.document.details.experience.log[logIndex].index
          lastPushed.spent = this.document.details.experience.log[logIndex].spent
          lastPushed.total = this.document.details.experience.log[logIndex].total
          lastPushed.counter++
        }
        else {
          lastPushed = foundry.utils.duplicate(this.document.details.experience.log[logIndex]);
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

    
    static async _onMetaClick(ev)
    {
      let type = ev.target.dataset.metaType;
      this.actor.update(ev.button == 0 ? this.actor.system.status.increment(type) : this.actor.system.status.decrement(type))
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

      
}