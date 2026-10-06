import WFRP_Utility from "../../../system/utility-wfrp4e";

export class TrappingsStage extends BaseCharacterCreationStage
{
    static DEFAULT_OPTIONS = 
        {
            tag: "form",
            classes : ["species", "wfrp4e"],
            window : {
                title : "WH.CharacterCreation.Stage",
                contentClasses : ["standard-form"],
                frame: false,
                positioned: false
            },
            position : {
            },
            actions : {
              chooseTrappings: this._onChooseTrappings,
              rollIncome: this._onRollIncome,
            },

        };

    static PARTS = {
        trappings : {template : "systems/wfrp4e/templates/apps/chargen/v2/stages/trappings.hbs"},
    };

    handleStageArgs({species, career})
    {
        this.data.career = new Item.implementation(career);
        this.data.trappings = [];

        let classStrings = game.wfrp4e.config.classTrappings[this.data.career.system.class.value]?.split(",") || [];
        this.data.classTrappings  = Promise.all(classStrings.map(i => WFRP_Utility.find(i.trim(), game.wfrp4e.config.trappingItems)));
    }

    async getStageResults(formData) 
    {
        
        await super.getStageResults(formData);
        let result = {
          items: this.data.trappings.concat()
        }

        return result;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.trappings = this.data.trappings;
        context.income = this.data.income;
        return context;
    }

    static async _onChooseTrappings(ev, target)
    {
      this.data.trappings = (await this.data.career.system.trappings.promptDecision()).concat((await this.data.classTrappings).filter(i => i).map(i => i.toObject?.() || i));
      this.render(true);
    }

    static async _onRollIncome()
    {
      this.data.income = await game.wfrp4e.market.rollIncome(this.data.career);
      // this.updateMessage("Income", { name: this.context.income.item.name, quantity  : this.context.income.item.system.quantity.value })
      this.render(true);
    }

    _addEventListeners()
    {

    }

}