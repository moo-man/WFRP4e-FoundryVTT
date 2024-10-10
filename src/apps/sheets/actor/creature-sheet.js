import WFRP_Audio from "../../../../modules/system/audio-wfrp4e";
import StandardWFRP4eActorSheet from "./standard-sheet";

export default class ActorSheetWFRP4eCreatureV2 extends StandardWFRP4eActorSheet
{
    static DEFAULT_OPTIONS = {
        classes: ["creature"],
        actions: {
        },
        window : {
          resizable : true
        },
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/actor/characteristic-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/actor-tabs.hbs' },
        main: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/creature/creature-main.hbs'},
        skills: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-skills.hbs' },
        talents: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-talents.hbs' },
        combat: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-combat.hbs' },
        effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-effects.hbs' },
        magic: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-magic.hbs' },
        religion: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-religion.hbs' },
        trappings: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-inventory.hbs' },
        notes: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/actor/npc/npc-notes.hbs' },
      }
      
      async _prepareContext(options)
      {
        let context = await super._prepareContext(options);
        return context;
      }

    // _prepareMainContext(context) {
      
    // }
    
   

}