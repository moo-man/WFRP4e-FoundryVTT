import TraitTest from "../../system/rolls/trait-test";
import AttackDialog from "./attack-dialog";

export default class TraitDialog extends AttackDialog {

    testClass = TraitTest
    subTemplate = "systems/wfrp4e/templates/dialog/weapon-dialog.hbs";
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

    static async setup(fields={}, data={}, options={})
    {
        if (!data.trait.id)
        {
            data.trait = new CONFIG.Item.documentClass(data.trait, { parent: this.actor})
        }
        let trait = data.trait;

        // TODO account for skill 
        options.title = options.title || game.wfrp4e.config.characteristics[trait.rollable.rollCharacteristic] + ` ${game.i18n.localize("Test")} - ` + trait.name;
        options.title += options.appendTitle || "";
  
      if (!trait.rollable.value)
      {
        return ui.notifications.notify("Non-rollable trait");
      }

      data.skill = data.actor.itemTags["skill"].find(sk => sk.name == trait.rollable.skill)
      data.characteristic = data.skill?.system.characteristic.key || trait.rollable.rollCharacteristic
      data.hitLocationTable = game.wfrp4e.tables.getHitLocTable(data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc");

      if (trait.attackType == "melee")
      {
        data.chargingOption = true;
      }
      

      data.scripts = data.scripts.concat(data.trait?.getScripts("dialog"), data.skill?.getScripts("dialog") || [])
      data.scripts = data.scripts.concat(data.actor.system.vehicle?.getScripts("dialog") || [])


      return new Promise(resolve => {
        let dlg = new this(data, fields, options, resolve)
        if (options.bypass)
        {
            dlg.bypass()
        }
        else 
        {
            dlg.render(true);
        }
    })
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
        return this.item.rollable.defaultDifficulty || super._defaultDifficulty()
    }

    // Backwards compatibility for effects
    get type() 
    {
      return "trait";
    }
}