import { ChargenStage } from "./stage";

export class CareerStage extends ChargenStage {
  journalId = "Compendium.wfrp4e-core.journals.JournalEntry.IQ0PgoJihQltCBUU.JournalEntryPage.bS2sxusEp1FEqmRk"
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 400;
    options.height = 670;
    options.classes.push("career");
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.StageCareer");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageCareer"); }

  constructor(...args) {
    super(...args);
    this.careers = this.loadCareers();
    this.context.step = 0;
    this.context.careers = [];
    this.context.replacements = [];
    this.context.career = null;
    this.context.exp = 0;
  }


  get template() {
    return "systems/wfrp4e/templates/apps/chargen/career.hbs";
  }


  async onRollCareer(event) {
    this.context.step++;

    // First step, roll 1 career
    if (this.context.step == 1) {
      this.context.exp = 50;
      await this.addCareerChoice();
      // QoL: Upon the first career roll, automatically set the selected career to it
      this.context.career = this.context.careers[0];
    }
    // Second step, Roll 2 more careers
    if (this.context.step == 2) {
      this.context.exp = 25;
      await this.addCareerChoice(2);
    }
    // Third step, keep rolling careers
    if (this.context.step >= 3) {
      this.context.exp = 0;
      await this.addCareerChoice();
    }
  }

  // Career selected, move on to the next step
  async onSelectCareer(ev) {
    let careerItem = await this.findT1Careers(ev.currentTarget.dataset.career);
    if (careerItem) {
      this.context.career = careerItem[0];
      this.updateMessage("Chosen", {chosen : this.context.career.name})

    }
    else {
      throw new Error(gam.i18n.format("CHARGEN.ERROR.CareerItem", {career : ev.currentTarget.dataset.career}));
    }
    this.render(true);
  }

  _updateObject(event, formData) {
    this.data.items.career = this.context.career.toObject();
    this.data.exp.career = this.context.exp;

    this.data.items.career.system.current.value = true;
    super._updateObject(event, formData)

  }

  async getData() {
    let data = await super.getData();
    for (let c of this.context.careers.concat(this.context.replacements)) {
      c.enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(c.system.description.value, { async: true });
    }
    data.showChooseButton = this.context.replacements.length + this.context.careers.length > 1
    return data
  }


  async _onDrop(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

    if (dragData.type == "Item") {
      let career = await Item.implementation.fromDropData(dragData)

      if (career.type != "career")
        return

      // If career level is not T1, find the T1 career and use that instead
      else if (career.system.level.value > 1)
      {
        let careerT1 = await this.findT1Careers(career.system.careergroup.value)
        if (careerT1[0])
          career = careerT1[0]
      }

      this.context.step = 4;
      this.context.exp = 0;
      this.context.careers.push(career)
      this.context.career = career;
      this.updateMessage("Chosen", {chosen : career.name})
    }
    this.render(true);
  }

  async validate() {
    let valid = super.validate()
    if (!this.context.career)
    {
      this.showError("CareerSubmit")
      valid = false
    }
    return valid
  }

  async addCareerChoice(number = 1) {
    let rollSpecies = this.data.species;

    // If subspecies has defined specific table, and it's found, use that
    let subspeciesCareerTable = this.data.subspecies && game.wfrp4e.config.subspecies[this.data.species][this.data.subspecies]?.careerTable || null;
    if (subspeciesCareerTable && game.wfrp4e.tables.findTable("career", subspeciesCareerTable))
      rollSpecies = game.wfrp4e.config.subspecies[this.data.species][this.data.subspecies]?.careerTable;
    // If subspecies table is found, use that
    else if (this.data.subspecies && game.wfrp4e.tables.findTable("career", rollSpecies + "-" + this.data.subspecies))
      rollSpecies += "-" + this.data.subspecies;
    

    // If Human (no subspecies) and no "human" career table exists, use `human-reiklander` if it exists
    // This is backwards compatibility (human-reiklander table changed to just human)
    if (this.data.species == "human" && !game.wfrp4e.tables.findTable("career", "human") && game.wfrp4e.tables.findTable("career", "human-reiklander"))
    {
      rollSpecies = "human-reiklander"
    }

    for (let i = 0; i < number; i++) {
      let careerResult = await this.rollCareerTable(rollSpecies)
      let careerName = careerResult.text;

      // Some books that add careers define replacement options, such as (If you roll career X you can use this new career Y (e.g. Soldier to Ironbreaker))
      // If there's a replacement option for a given career, add that replacement career too
      let replacementOptions = game.wfrp4e.config.speciesCareerReplacements[this.data.species]?.[careerName] || []
      replacementOptions = replacementOptions.concat(game.wfrp4e.config.speciesCareerReplacements[`${this.data.species}-${this.data.subspecies}`]?.[careerName] || [])

      let t1Careers = await this.findT1Careers(careerName)
      
      this.context.careers = this.context.careers.concat(t1Careers);
      if (replacementOptions.length > 0)
      {
        let replacements = await this.findT1Careers(replacementOptions)
        this.context.replacements = this.context.replacements.concat(replacements)
      }

      this.updateMessage("Rolled", {rolled : t1Careers.map(i => i.name).join(", ")})
    }
    this.render(true);
  }

  /**
   * Rolls on a career table based on provided species
   * Separated into its own function to cleanly overwrite in modules
   * 
   * @param {String} species Species table to roll on
   * @returns 
   */
  async rollCareerTable(species)
  {
    return await game.wfrp4e.tables.rollTable("career", {}, species);
  }

  /**
   * Given a career name, find the T1 item for that career
   * "Witch Hunter" -> Interrogator Item
   *
   * @param {String} careerName Name of career to be posted
   */
  async findT1Careers(careerNames) {

    let careers = await this.careers
    let careersFound = [];
    
    if (typeof careerNames == "string")
      careerNames = [careerNames];

    // Find the tier 1 rank that corresponds with the career name
    for (let c of careers) {
      if (careerNames.includes(c.system.careergroup.value) && c.system.level.value == 1)
        careersFound.push(c);
      if (careersFound.length == careerNames.length)
        break;
    }

    if (careerNames.length != careersFound.length)
      this.showError("CareerItems", {num : careerNames.length - careersFound.length, careers : careerNames.toString()})
    return careersFound;
  }

  async loadCareers()
  {
    let packs = game.wfrp4e.tags.getPacksWithTag("career");
    let careers = game.items.filter(i => i.type == "career");

    let counter = 1;
    let num = packs.length;
    for (let pack of packs)
    {
      foundry.applications.ui.SceneNavigation.displayProgressBar({label: game.i18n.localize("CHARGEN.Career.LoadingCareers"), pct: Math.round((counter / num) * 100) })
      counter++;
      careers = careers.concat((await pack.getDocuments()).filter(i => i.type == "career"));
    }

    return careers;
  }

  
  activateListeners(html) {
    super.activateListeners(html);
    const dragDrop = new foundry.applications.ux.DragDrop.implementation({
      dropSelector: '.chargen-content',
      permissions: { drop: () => true },
      callbacks: { drop: this._onDrop.bind(this) },
    });

    dragDrop.bind(html[0]);
  }
}
