import TraitTest from "../../system/rolls/trait-test";
import AttackDialog from "./attack-dialog";

export default class TraitDialog extends AttackDialog {

    testClass = TraitTest

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

      data.skill = data.actor.itemTypes["skill"].find(sk => sk.name == trait.rollable.skill)
      data.characteristic = data.skill?.system.characteristic.key || trait.rollable.rollCharacteristic

      data.scripts = data.scripts.concat(data.trait?.getScripts("dialog"), data.skill?.getScripts("dialog"))


        return new Promise(resolve => {
            new this(fields, data, resolve, options).render(true);
        })
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