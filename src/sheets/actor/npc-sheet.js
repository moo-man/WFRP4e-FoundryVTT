import WFRP_Audio from "../../system/audio-wfrp4e";
import StandardWFRP4eActorSheet from "./standard-sheet";

export default class ActorSheetWFRP4eNPC extends StandardWFRP4eActorSheet
{
    static DEFAULT_OPTIONS = {
        classes: ["npc"],
        actions: {
          getIncome: this._getIncome
        },
        window : {
          resizable : true
        },
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/actor/characteristic-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/actor-tabs.hbs' },
        main: { scrollable: ["", ".basic .list-content", ".advanced .list-content"], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-skills.hbs', classes: ["skills"] },
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

      _prepareMainContext(context) {
        return super._prepareSkillsContext(context);
      }
    
    static async _getIncome(event) {
      let status = this.actor.system.details.status.value.split(" ");
      let tier = warhammer.utility.findKey(status[0], game.wfrp4e.config.statusTiers)[0] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
      let standing = Number(status[1]);     // Multilpy that first letter by your standing (Brass 4 = 8d10 pennies)
      let {earned} = await game.wfrp4e.market.rollIncome(null, {standing, tier});
  
      let paystring
      switch (tier) {
        case "b":
          paystring = `${earned}${game.i18n.localize("MARKET.Abbrev.BP").toLowerCase()}.`
          break;
        case "s":
          paystring = `${earned}${game.i18n.localize("MARKET.Abbrev.SS").toLowerCase()}.`
          break;
        case "g":
          paystring = `${earned}${game.i18n.localize("MARKET.Abbrev.GC").toLowerCase()}.`
          break;
      }
      let money = game.wfrp4e.market.creditCommand(paystring, this.actor, { suppressMessage: true })
      WFRP_Audio.PlayContextAudio({ item: { type: "money" }, action: "gain" })
      this.actor.updateEmbeddedDocuments("Item", money);
    }
}