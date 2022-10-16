import NameGenWfrp from "../name-gen.js";
import { ChargenStage } from "./stage";

export class DetailsStage extends ChargenStage {
  journalId = "Compendium.wfrp4e-core.journal-entries.IQ0PgoJihQltCBUU.JournalEntryPage.Q4C9uANCqPzlRKFD"
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 450;
    options.height = 600;
    options.classes.push("details");
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.StageDetails");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageDetails"); }

  get template() {
    return "systems/wfrp4e/templates/apps/chargen/details.html";
  }

  constructor(...args) {
    super(...args);
  }
  context = {
    gender: ""
  };


  async getData() {
    let data = await super.getData();
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".roll-details").click(async (ev) => {
      let type = ev.currentTarget.dataset.type;
      if (this[type]) {
        let value = await this[type]();
        let input = $(ev.target).parents(".form-group").find("input")[0];
        input.value = value;
      }
    });

    html.find("input[name='gender']").change(ev => {
      this.context.gender = ev.currentTarget.value; // Need to store gender to pass to name generation
    });
  }

  _updateObject(ev, formData) {
    this.data.details.name = formData.name;
    this.data.details.gender = formData.gender;
    this.data.details.age = formData.age;
    this.data.details.height = formData.height;
    this.data.details.eyes = formData.eyes;
    this.data.details.hair = formData.hair;
    super._updateObject(ev, formData)
  }

  rollName() {
    return NameGenWfrp.generateName({ species: this.data.species, gender: this.context.gender });
  }
  async rollAge() {
    return (await new Roll(game.wfrp4e.config.speciesAge[this.data.species]).roll()).total;
  }
  async rollHeight() {
    let heightRoll = (await new Roll(game.wfrp4e.config.speciesHeight[this.data.species].die).roll()).total;
    let hFeet = game.wfrp4e.config.speciesHeight[this.data.species].feet;
    let hInches = game.wfrp4e.config.speciesHeight[this.data.species].inches + heightRoll;
    hFeet += Math.floor(hInches / 12);
    hInches = hInches % 12;
    return `${hFeet}'${hInches}`;
  }
  async rollEyes() {
    return (await game.wfrp4e.tables.rollTable("eyes", {}, this.data.species)).result;
  }
  async rollHair() {
    return (await game.wfrp4e.tables.rollTable("hair", {}, this.data.species)).result;
  }
}
