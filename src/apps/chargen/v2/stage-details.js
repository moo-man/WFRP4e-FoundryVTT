import WFRP_Utility from "../../../system/utility-wfrp4e";
import NameGenWfrp from "../../name-gen";

export class DetailsStage extends BaseCharacterCreationStage
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
              rollDetails: this._onRollDetails
            },

        };

    static PARTS = {
        details : {template : "systems/wfrp4e/templates/apps/chargen/v2/stages/details.hbs"},
    };

    handleStageArgs({species})
    {
        this.data.species = new Item.implementation(species);
    }

    async getStageResults(formData) 
    {
        await super.getStageResults(formData);
        return {
          "name" : formData.object.name,
          "system.details.gender.value" : formData.object.gender,
          "system.details.age.value" : formData.object.age,
          "system.details.height.value" : formData.object.height,
          "system.details.eyecolour.value" : formData.object.eyes,
          "system.details.haircolour.value" : formData.object.hair,
          "system.details.motivation.value" : formData.object.motivation,
          "system.details.personal-ambitions.short-term" : formData.object.short,
          "system.details.personal-ambitions.long-term" : formData.object.long
        }
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.details = this.data.details;
        return context;
    }

    static async _onRollDetails(ev, target)
    {
      let value;
      switch (target.dataset.type)
      {
        case "name":
          value = await this.rollName();
        break;
        case "age":
          value = await this.rollAge();
          break;
        case "height":
          value = await this.rollHeight();
          break;
        case "eyes":
          value = await this.rollEyes();
          break;
        case "hair":
          value = await this.rollHair();
          break;
        case "motivation":
          value = await this.rollMotivation();
          break;
      }

      target.closest(".detail-form").querySelector("input").value = value;
      // save form data to populate if closed
      this.data.details = new foundry.applications.ux.FormDataExtended(this.element).object;
    }

    async rollName() {
      return NameGenWfrp.generateName({ species: this.data.species.system.key, gender: this.element.querySelector("[name=gender]").value});
    }

    async rollAge() {
      return (await new Roll(this.data.species.system.age).roll()).total
    }

    async rollHeight() 
    {
      let feet = this.data.species.system.height.feet;
      let inches = this.data.species.system.height.inches;
      let roll = (await new Roll(this.data.species.system.height.formula).roll()).total

      feet += Math.floor((inches + roll) / 12);
      inches = (inches + roll) % 12;
      return `${feet}'${inches}"`;
    }

    async rollEyes() {
      let table = await this.data.species.system.tables.eye.document;
      let result = await table.roll();
      return result.results[0].name;
    }

    async rollHair() {
      let table = await this.data.species.system.tables.hair.document;
      let result = await table.roll();
      return result.results[0].name;
    }

    async rollMotivation() {
      return (await game.wfrp4e.tables.rollTable("motivation")).text;
    }

    _addEventListeners()
    {
      this.element.querySelectorAll("input").forEach(el=> {
          el.addEventListener("change", (ev) => {
            this.data.details[ev.target.name] = ev.target.value;
          })
      });
    }

}