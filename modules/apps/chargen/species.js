import { ChargenStage } from "./stage";

export class SpeciesStage extends ChargenStage {

  journalId = "Compendium.wfrp4e-core.journals.JournalEntry.IQ0PgoJihQltCBUU.JournalEntryPage.l0f11ypRjH9sR48Q"

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 450;
    options.height = 550;
    options.classes.push("species");
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.StageSpecies");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageSpecies"); }


  get template() {
    return "systems/wfrp4e/templates/apps/chargen/species.hbs";
  }


  context = {
    species: "",
    subspecies: "",
    exp: 0
  };


  async getData() {
    let data = await super.getData();

    data.context = this.context;

    let speciesTable = game.wfrp4e.tables.findTable("species");

    if (!speciesTable)
    {
      ui.notifications.error(game.i18n.localize("CHARGEN.ERROR.SpeciesTable"))
      throw new Error (game.i18n.localize("CHARGEN.ERROR.SpeciesTable"))
    }

    data.species = {}

    for (let result of speciesTable.results)
    {
      let speciesKey = game.wfrp4e.utility.findKey(result.text, game.wfrp4e.config.species)
      if (speciesKey)
      {
        data.species[speciesKey] = result.text
      }
    }

    data.speciesDisplay = game.wfrp4e.config.species[this.context.species];

    if (this.context.species && game.wfrp4e.config.subspecies[this.context.species]) {
      data.subspeciesChoices = game.wfrp4e.config.subspecies[this.context.species];
    }

    if (this.context.subspecies) {
      data.speciesDisplay += ` (${game.wfrp4e.config.subspecies[this.context.species][this.context.subspecies]?.name})`;
    }

    return data;
  }


  async validate() {
    let valid = super.validate();
    if (!this.context.species)
    {
      this.showError("SpeciesSubmit")
      valid = false
    }
    return valid
  }


  /**
   * The user is allowed to freely click and choose species, but can only roll for it one time.
   * After species is rolled, user can click and choose a different species, but cannot go back and roll again
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", '.species-select', this.onSelectSpecies.bind(this));
    html.on("click", '.subspecies-select', this.onSelectSubspecies.bind(this));
  }


  // Set roll, unselect whatever user has chosen
  async onRollSpecies(event) {
    event.stopPropagation();
    this.context.exp = 20;
    this.context.roll = await game.wfrp4e.tables.rollTable("species");
    this.context.choose = false;
    this.updateMessage("Rolled", {rolled : this.context.roll.result})
    this.setSpecies(this.context.roll.species);
  }

  // Set chosen species, but don't unset "roll" (prevents users from rolling again after they've rolled once)
  onSelectSpecies(event) {
    this.context.exp = 0;
    this.context.choose = event.currentTarget.dataset.species;
    this.updateMessage("Chosen", {chosen : game.wfrp4e.config.species[this.context.choose]})
    this.setSpecies(this.context.choose);
  }


  onSelectSubspecies(event) {
    this.setSpecies(this.context.species, event.currentTarget.dataset.subspecies);
  }


  _updateObject(event, formData) {
    this.data.species = this.context.species;
    this.data.subspecies = this.context.subspecies;
    this.data.exp.species = this.context.exp;
    super._updateObject(event, formData)

  }


  setSpecies(species, subspecies) {
    this.context.species = species;
    if (subspecies) {
      this.context.subspecies = subspecies;
    }
    else if (Object.keys(game.wfrp4e.config.subspecies[species] || {})?.length == 1) {
      this.context.subspecies = Object.keys(game.wfrp4e.config.subspecies[species])[0];
    }
    else {
      this.context.subspecies = "";
    }
    this.render(true);
  }
}
