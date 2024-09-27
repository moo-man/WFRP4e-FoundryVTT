import CareerSelector from "../../../../modules/apps/career-selector";
import Advancement from "../../../../modules/system/advancement";
import WFRP_Utility from "../../../../modules/system/utility-wfrp4e";
import StandardWFRP4eActorSheet from "./standard-sheet";

export default class CharacterWFRP4eSheet extends StandardWFRP4eActorSheet
{
    static DEFAULT_OPTIONS = {
        classes: ["npc"],
        actions: {
        },
        window : {
          resizable : true
        },
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/actor/character/characteristic-header.hbs', classes: ["sheet-header"] },
        main: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-skills.hbs' },
        careers: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/npc/npc-careers.hbs' },
        talents: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-talents.hbs' },
        combat: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-combat.hbs' },
        effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-effects.hbs' },
        magic: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-magic.hbs' },
        religion: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-religion.hbs' },
        trappings: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-inventory.hbs' },
        notes: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/npc/npc-notes.hbs' },
      }

      static TABS = {
        main: {
          id: "main",
          group: "primary",
          label: "Main",
        },
        careers: {
          id: "careers",
          group: "primary",
          label: "Careers",
        },
        talents: {
          id: "talents",
          group: "primary",
          label: "Talents",
        },
        combat: {
          id: "combat",
          group: "primary",
          label: "Combat",
        },
        effects: {
          id: "effects",
          group: "primary",
          label: "Effects",
        },
        religion: {
          id: "religion",
          group: "primary",
          label: "Religion",
        },
        magic: {
          id: "magic",
          group: "primary",
          label: "Magic",
        },
        trappings: {
          id: "trappings",
          group: "primary",
          label: "Trappings",
        },
        notes: {
          id: "notes",
          group: "primary",
          label: "Notes",
        }
      }
      
      async _prepareContext(options)
      {
        let context = await super._prepareContext(options);
        return context;
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

}