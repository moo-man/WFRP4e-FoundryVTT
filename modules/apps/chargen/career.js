import WFRP_Utility from "../../system/utility-wfrp4e.js";
import { ChargenStage } from "./stage";

export class CareerStage extends ChargenStage {
  journalId = "Compendium.wfrp4e-core.journal-entries.IQ0PgoJihQltCBUU.JournalEntryPage.bS2sxusEp1FEqmRk"
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 300;
    options.height = 800;
    options.classes.push("career");
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.StageCareer");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageCareer"); }

  constructor(...args) {
    super(...args);
    this.context.step = 0;
    this.context.careers = [];
    this.context.career = null;
    this.context.exp = 0;
  }


  get template() {
    return "systems/wfrp4e/templates/apps/chargen/career.html";
  }


  async rollCareers(event) {
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

  _updateObject(event, formData) {
    this.data.items.career = this.context.career.toObject();
    this.data.exp.career = this.context.exp;

    this.data.items.career.system.current.value = true;
  }



  // Roll and add one more career choice
  async addCareerChoice(number = 1) {

    // Find column to roll on for caeer
    let rollSpecies = this.data.species;
    if (this.data.species == "human" && !this.data.subspecies)
      this.data.subspecies = "reiklander";
    if (this.data.subspecies && game.wfrp4e.tables.findTable("career", rollSpecies + "-" + this.data.subspecies))
      rollSpecies += "-" + this.data.subspecies;

    for (let i = 0; i < number; i++) {
      let newCareerRolled = await game.wfrp4e.tables.rollTable("career", {}, rollSpecies);
      let newCareerName = newCareerRolled.text;
      this.context.careers = this.context.careers.concat(await this.findT1Careers(newCareerName));
      for (let c of this.context.careers) {
        c.enriched = await TextEditor.enrichHTML(c.system.description.value, { async: true });
      }
    }
    this.render(true);
  }


  // Choose career shows the career list for the user to choose which career they want
  async chooseCareer() {
    this.context.choose = true;
    this.context.exp = 0;
    this.context.careerList = [];
    this.context.step++;

    let rollSpecies = this.data.species;
    let table = game.wfrp4e.tables.findTable("career", rollSpecies);
    if (this.data.subspecies && game.wfrp4e.tables.findTable("career", rollSpecies + "-" + this.data.subspecies)) {
      rollSpecies += "-" + this.data.subspecies;
      table = game.wfrp4e.tables.findTable("career", rollSpecies);
    }
    for (let r of table.results) {
      this.context.careerList.push(WFRP_Utility.extractLinkLabel(r.text));
    }
    this.render(true);
  }


  // Career selected, move on to the next step
  async selectCareer(ev) {
    let careerItem = await this.findT1Careers(ev.currentTarget.dataset.career);
    if (careerItem) {
      this.context.career = careerItem[0];
    }
    else {
      throw new Error("Cannot find Tier 1 Career Item " + ev.currentTarget.dataset.career);
    }
    this.render(true);
  }

  /**
   * Given a career name, find the T1 item for that career
   * "Witch Hunter" -> Interrogator Item
   *
   * @param {String} careerName Name of career to be posted
   */
  async findT1Careers(careerNames) {

    if (typeof careerNames == "string")
      careerNames = [careerNames];

    let packs = game.wfrp4e.tags.getPacksWithTag("career");
    let careers = game.items.filter(i => i.type == "career");
    let careersFound = [];

    for (let pack of packs)
      careers = careers.concat((await pack.getDocuments()).filter(i => i.type == "career"));

    // Find the tier 1 rank that corresponds with the career name
    for (let c of careers) {
      if (careerNames.includes(c.system.careergroup.value) && c.system.level.value == 1)
        careersFound.push(c);
      if (careersFound.length == careerNames.length)
        break;
    }

    if (careerNames.length != careersFound.length)
      ui.notifications.error(`${careerNames.length - careersFound.length} career Items could not be found (out of ${careerNames.toString()})`);
    return careersFound;
  }
}
