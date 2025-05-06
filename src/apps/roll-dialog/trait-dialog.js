import TraitTest from "../../system/rolls/trait-test";
import AttackDialog from "./attack-dialog";
import CharacteristicDialog from "./characteristic-dialog";

export default class TraitDialog extends AttackDialog {

    testClass = TraitTest
    chatTemplate = "systems/wfrp4e/templates/chat/roll/weapon-card.hbs"

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["trait-roll-dialog"]);
        return options;
    }

    get item()
    {
      return this.data.trait
    }

    get trait() 
    {
      return this.item;
    }

    static PARTS = {
      fields : {
          template : "systems/wfrp4e/templates/dialog/v2/base-dialog.hbs",
          container : {id : "base", classes : ["dialog-base"]}
      },
      modifiers : {
          template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
          container : {id : "base", classes : ["dialog-base"]}
      },
      specific : {
          template : "systems/wfrp4e/templates/dialog/v2/trait-dialog.hbs",
      },
      footer : {
          template : "templates/generic/form-footer.hbs"
      }
  };

    static async setupData(trait, actor, context={}, options={})
    {
      if (!trait.rollable.value)
      {
        return ui.notifications.notify("Non-rollable trait");
      }

      // TODO account for skill 
      context.title = context.title || game.wfrp4e.config.characteristics[trait.system.rollable.rollCharacteristic] + ` ${game.i18n.localize("Test")} - ` + trait.name;
      context.title += context.appendTitle || "";
      delete context.appendTitle;
      
      let dialogData;

      let skill
      if (trait.system.rollable.skill)
      {
        skill = data.actor.itemTags["skill"].find(sk => sk.name == trait.system.rollable.skill)
        if (!skill)
          {
            skill = {
              name : trait.system.rollable.skill,
              id : "unknown",
              system : {
                characteristic : {
                  value : ""
                }
              }
            }
          }

          dialogData = await super.setupData(skill, actor, context, options)

      }
      else if (trait.system.rollable.rollCharacteristic)
      {
        dialogData = await CharacteristicDialog.setupData(trait.system.rollable.rollCharacteristic, actor, context, options)
      }

      let data = dialogData.data
      data.trait = trait;
      data.skill = skill;
      data.characteristic = trait.system.rollable.rollCharacteristic;

      if (trait.attackType == "melee")
      {
        data.chargingOption = true;
      }

      data.scripts = data.scripts.concat(data.trait?.getScripts("dialog").filter(s => !s.options.defending), skill?.getScripts("dialog").filter(s => !s.options.defending) || [])


      return dialogData;
    }


    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        data.item = this.data.trait.id || this.data.trait.toObject()
        data.characteristicToUse = this.data.characteristic;
        return data;
    }
  
    

    _defaultDifficulty()
    {
        return this.item.system.rollable.defaultDifficulty || super._defaultDifficulty()
    }

    // Backwards compatibility for effects
    get type() 
    {
      return "trait";
    }
}