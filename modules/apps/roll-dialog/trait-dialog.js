import AttackDialog from "./attack-dialog";

export default class TraitDialog extends AttackDialog {

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

    async setup(fields={}, data={}, options={})
    {
        if (!data.trait.id)
        {
            data.trait = new CONFIG.Item.documentClass(data.trait, { parent: this.actor})
        }
        let trait = data.trait;

        // TODO account for skill 
        options.title = options.title || game.wfrp4e.config.characteristics[trait.rollable.rollCharacteristic] + ` ${game.i18n.localize("Test")} - ` + trait.name;
        options.title += options.appendTitle || "";

      // Default hit location checked if the rollable trait's characteristic is WS or BS
      if (trait.rollable.rollCharacteristic == "ws" || trait.rollable.rollCharacteristic == "bs")
        data.hitLocation = "roll";
      else 
        data.hitLocation = "none"
  
        if (!trait.rollable.value)
          return ui.notifications.notify("Non-rollable trait");


        return new Promise(resolve => {
            new this(fields, data, resolve, options)
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