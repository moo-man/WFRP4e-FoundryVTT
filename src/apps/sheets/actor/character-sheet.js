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
        notes: { template: 'systems/wfrp4e/templates/sheets/actor/character/character-notes.hbs' },
      }


      async _prepareContext(options)
      {
        let context = await super._prepareContext(options);
        context.experienceLog = this._condenseXPLog()
        return context;
      }
  
  
    
    _condenseXPLog() {
      let condensed= []
      for (
        let logIndex = 0, lastPushed, lastPushedCounter = 0;
        logIndex < this.document.system.details.experience.log.length;
        logIndex++) {
        let condense = false;
        if ( // If last pushed exists, and is the same, type, same reason, and both are positiev or both are negative
          lastPushed &&
          lastPushed.type == this.document.system.details.experience.log[logIndex].type &&
          lastPushed.reason == this.document.system.details.experience.log[logIndex].reason &&
          ((lastPushed.amount >= 0 && this.document.system.details.experience.log[logIndex].amount >= 0)
            || (lastPushed.amount <= 0 && this.document.system.details.experience.log[logIndex].amount <= 0))) { condense = true; }
  
        if (condense) {
          lastPushed[lastPushed.type] = this.document.system.details.experience.log[logIndex][lastPushed.type]
          lastPushed.amount += this.document.system.details.experience.log[logIndex].amount
          lastPushed.index = this.document.system.details.experience.log[logIndex].index
          lastPushed.spent = this.document.system.details.experience.log[logIndex].spent
          lastPushed.total = this.document.system.details.experience.log[logIndex].total
          lastPushed.counter++
        }
        else {
          lastPushed = foundry.utils.duplicate(this.document.system.details.experience.log[logIndex]);
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

      
}