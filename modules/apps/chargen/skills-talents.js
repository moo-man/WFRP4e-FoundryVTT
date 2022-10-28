import WFRP_Utility from "../../system/utility-wfrp4e.js";
import { ChargenStage } from "./stage";

export class SkillsTalentsStage extends ChargenStage {
  journalId = "Compendium.wfrp4e-core.journal-entries.IQ0PgoJihQltCBUU.JournalEntryPage.f5Y4XenZVtDU2GUo"
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 450;
    options.height = 800;
    options.classes.push("skills-talents");
    options.minimizable = true;
    options.cannotResubmit = true
    options.title = game.i18n.localize("CHARGEN.StageSkillsTalents");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageSkillsTalents"); }


  constructor(...args) {
    super(...args);
    let { skills, talents } = WFRP_Utility.speciesSkillsTalents(this.data.species, this.data.subspecies);

    for (let skill of skills) {
      this.context.speciesSkills[skill] = 0;
    }

    for (let talent of talents) {

      // Set random talent count
      if (Number.isNumeric(talent)) {
        this.context.speciesTalents.randomCount = Number(talent);
      }


      // Comma means it's a choice
      else if (talent.includes(",")) {
        this.context.speciesTalents.choices.push(talent);
        this.context.speciesTalents.chosen.push("");
      }

      else
        this.context.speciesTalents.normal.push(talent);

      // Don't show roll if no random talents
      if (this.context.speciesTalents.randomCount == 0) {
        this.context.rolled = true;
      }
    }


    for (let skill of this.data.items.career.system.skills) {
      this.context.careerSkills[skill] = 0;
    }

    for (let talent of this.data.items.career.system.talents) {
      this.context.careerTalents[talent] = false;
    }
  }


  get template() {
    return "systems/wfrp4e/templates/apps/chargen/skills-talents.html";
  }


  context = {
    speciesSkills: {},
    speciesTalents: {
      normal: [],
      chosen: [],
      random: [],
      rolled: false,
      randomCount: 0,
      choices: [],
      duplicates: [] // Index of a duplicate random
    },
    careerSkills: {},
    careerTalents: {}
  };

  async getData() {
    let data = await super.getData();
    data.speciesSkillAllocation = {
      0: [],
      3: [],
      5: []
    };

    // Sort into arrays
    for (let skill in this.context.speciesSkills) {
      data.speciesSkillAllocation[this.context.speciesSkills[skill]].push(skill);
    }

    data.talents = {
      normal: this.context.speciesTalents.normal,

      // Separate choices ("Savvy,Suave") into {name : Suave, chosen : true/false}, {name : Savvy, chosen : true/false}
      choices: this.context.speciesTalents.choices.map((choice, index) => {
        return choice.split(",").map(i => {
          let name = i.trim();
          return {
            name,
            chosen: this.context.speciesTalents.chosen[index] == name
          };
        });
      }),
      random: this.context.speciesTalents.random,
      rolled: this.context.speciesTalents.rolled,
      chosen: this.context.speciesTalents.chosen
    };

    data.careerSkills = this.context.careerSkills;
    data.careerTalents = this.context.careerTalents;
    data.pointsAllocated = 40 - Object.values(this.context.careerSkills).reduce((prev, current) => prev + current, 0)

    return data;
  }

  async _updateObject(ev, formData) {
    // Merge career/species skill advances into data
    for (let skill in this.context.speciesSkills) {
      if (isNaN(this.data.skillAdvances[skill]))
        this.data.skillAdvances[skill] = 0;
      this.data.skillAdvances[skill] += this.context.speciesSkills[skill];
    }
    for (let skill in this.context.careerSkills) {
      if (isNaN(this.data.skillAdvances[skill]))
        this.data.skillAdvances[skill] = 0;
      this.data.skillAdvances[skill] += this.context.careerSkills[skill];
    }
    let careerTalent;
    for (let talent in this.context.careerTalents) {
      if (this.context.careerTalents[talent])
        careerTalent = talent;
    }
    let talents = await Promise.all([].concat(
      this.context.speciesTalents.normal.map(WFRP_Utility.findTalent),
      this.context.speciesTalents.chosen.map(WFRP_Utility.findTalent),
      this.context.speciesTalents.random.map(WFRP_Utility.findTalent),
      [careerTalent].map(WFRP_Utility.findTalent)
    ));
    this.data.items.talents = talents;
    super._updateObject(ev, formData)

  }

  
  async validate() {
    let valid = super.validate();

    if (!this.validateSkills())
      valid = false

    if (this.context.speciesTalents.randomCount > 0 && !this.context.speciesTalents.rolled)
    {
      this.showError("SpeciesTalentsNotRolled")
      valid = false
    }

    if (this.context.speciesTalents.chosen.filter(i => i).length < this.context.speciesTalents.choices.length)
    {
      this.showError("SpeciesTalentsNotChosen")
      valid = false
    }

    if (Object.values(this.context.careerTalents).every(i => i == false))
    {
      this.showError("CareerTalentNotChosen")
      valid = false
    }

    if (Object.values(this.context.careerSkills).reduce((prev, current) => prev + current, 0) > 40)
    {
      this.showError("CareerSkillAllocation")
      valid = false
    }

    return valid
  }

  validateSkills() {
    let skills = Object.values(this.context.speciesSkills)
    let threes = skills.filter(i => i == 3).length
    let fives = skills.filter(i => i == 5).length

    if (threes > 3 || fives > 3)
    {
      this.showError("SpeciesSkillAdvancements")
      return false
    }
    else return true
  }



  activateListeners(html) {
    super.activateListeners(html);
    const dragDrop = new DragDrop({
      dragSelector: '.drag-skill',
      dropSelector: '.drag-area',
      permissions: { dragstart: () => true, drop: () => true },
      callbacks: { drop: this.onDropSkill.bind(this), dragstart: this.onDragSkill.bind(this) },
    });

    dragDrop.bind(html[0]);


    html.find(".talent-choice input").click(ev => {
      let target = ev.currentTarget.name?.split("-")[1];

      if (target == "career") {
        for (let talent of this.data.items.career.system.talents) {
          this.context.careerTalents[talent] = (talent == ev.currentTarget.value);
        }
      }
      else {
        this.context.speciesTalents.chosen[target] = ev.currentTarget.value;
      }

      this.render(true);

    });

    html.find(".career-skills input").change(ev => {
      ev.currentTarget.value = Math.max(0, Number(ev.currentTarget.value))
      if (ev.currentTarget.value > 10)
      {
        ev.currentTarget.value = 0;
        this.showError("CareerSkillAllocationBounds")
      }
      this.context.careerSkills[ev.currentTarget.dataset.skill] = Number(ev.currentTarget.value);
      this.render(true);
    });
  }


  onDropSkill(ev) {
    let skill = JSON.parse(ev.dataTransfer.getData("text/plain")).skill;
    this.context.speciesSkills[skill] = Number(ev.currentTarget.dataset.advance);
    if (!this.validateSkills())
    {
      this.context.speciesSkills[skill] = 0
    }

    this.render(true);
  }

  onDragSkill(ev) {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ skill: ev.currentTarget.textContent.trim() }));
  }

  async rollRandomTalents() {
    this.context.speciesTalents.rolled = true;
    for (let i = 0; i < this.context.speciesTalents.randomCount; i++) {
      let talent = await game.wfrp4e.tables.rollTable("talents");
      let existingIndex = this.context.speciesTalents.random.findIndex(i => i == talent.text);
      this.context.speciesTalents.random.push(talent.text);
      if (existingIndex > -1) {
        // Push index of new talent because it is a duplicate
        this.context.speciesTalents.duplicates.push(this.context.speciesTalents.random.length - 1);
      }
    }
    this.updateMessage("Rolled", {rolled : this.context.speciesTalents.random.join(", ")})
    this.render(true);
  }
}
