import WFRP_Audio from "../../system/audio-wfrp4e";
import WFRP_Utility from "../../system/utility-wfrp4e";
import StandardWFRP4eActorSheet from "./standard-sheet";

export default class ActorSheetWFRP4eCreature extends StandardWFRP4eActorSheet
{
    static DEFAULT_OPTIONS = {
        classes: ["creature"],
        actions: {
          overviewDropdown : this._onOverviewDropdown,
        },
        window : {
          resizable : true
        },
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/actor/characteristic-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/actor-tabs.hbs' },
        main: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/creature/creature-main.hbs'},
        skills: { scrollable: ["", ".basic .list-content", ".advanced .list-content"], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-skills.hbs' },
        combat: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-combat.hbs' },
        effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-effects.hbs' },
        magic: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-magic.hbs' },
        religion: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-religion.hbs' },
        trappings: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-inventory.hbs' },
        notes: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/creature/creature-notes.hbs' },
      }

      static TABS = {
        main: {
          id: "main",
          group: "primary",
          label: "Main",
        },
        skills: {
          id: "skills",
          group: "primary",
          label: "Skills",
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

    _prepareMainContext(context) {
    
        context.trained = this.actor.itemTags.skill.filter(i => i.advances.value > 0).sort(WFRP_Utility.nameSorter);
        context.includedTraits = this.actor.itemTags.trait.filter(i => i.included).sort(WFRP_Utility.nameSorter);
        context.talents = [];
        for(let talent of context.items.talent)
        {
          if (!context.talents.find(existing => existing.name == talent.name))
          {
            context.talents.push(talent);
          }
        }
        
        context.overviewButtons = this.actor.items.contents.reduce((buttons, item) => {
          let add = [];
          if (item.included)
          {
            add = item.sheetButtons.filter(i => !buttons.find(b => i.label == b.label))
          }
          return buttons.concat(add);
        }, []);
      }

      static async _onOverviewDropdown(ev) {
        let document = await this._getDocumentAsync(ev);
        let expandData = await document.system.expandData({secrets: this.actor.isOwner});
        this._toggleDropdown(ev, expandData.description.value + `<div class="tags">${expandData.properties?.length ? "<div class='tag'>" + expandData.properties.join("</div><div class='tag'>") : ""}</div>`, ".overview-content");
      }
}