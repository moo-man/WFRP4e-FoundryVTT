import BaseActorSheet from "./base-sheet"

export default class CharacterSheet extends BaseActorSheet
{
    static DEFAULT_OPTIONS = {
        classes: ["character"],
        actions: {
            
        },
        window : {
          resizable : true
        }
      }

      static PARTS = {
        header : {template : 'systems/wfrp4e/templates/sheets/actor/character/character-header.hbs', classes: ["sheet-header"] },
        tabs: { template: 'systems/wfrp4e/templates/sheets/actor/actor-tabs.hbs' },
        main: { template: 'systems/wfrp4e/templates/sheets/actor/character/character-main.hbs' },
        skills: { template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-skills.hbs' },
        talents: { template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-talents.hbs' },
        combat: { template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-combat.hbs' },
        effects: { template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-effects.hbs' },
        trappings: { template: 'systems/wfrp4e/templates/sheets/actor/tabs/actor-inventory.hbs' },
      }
}