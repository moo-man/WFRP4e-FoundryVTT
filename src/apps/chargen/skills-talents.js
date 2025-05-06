import WFRP_Utility from "../../system/utility-wfrp4e.js";
import { ChargenStage } from "./stage";

export class SkillsTalentsStage extends ChargenStage {
  journalId = "Compendium.wfrp4e-core.journals.JournalEntry.IQ0PgoJihQltCBUU.JournalEntryPage.f5Y4XenZVtDU2GUo"
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 450;
    options.height = 850;
    options.classes.push("skills-talents");
    options.minimizable = true;
    options.cannotResubmit = true
    options.title = game.i18n.localize("CHARGEN.StageSkillsTalents");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageSkillsTalents"); }


  constructor(...args) {
    super(...args);
    let { skills, talents, randomTalents, talentReplacement, traits } = WFRP_Utility.speciesSkillsTalents(this.data.species, this.data.subspecies);

    for (let [key, value] of Object.entries(randomTalents)) {
      let table = game.wfrp4e.tables.findTable(key);

      if (!(table instanceof RollTable)) {
        ui.notifications.error(game.i18n.format("CHARGEN.ERROR.TalentsTableNotFound", {key, species: this.data.species, subspecies: this.data.subspecies}));
        continue;
      }

      this.context.speciesTalents.randomTalents[key] = {
        key: key,
        name: table.name,
        count: Number(value),
        left: Number(value),
        rolled: false,
        talents: []
      };
    }

    for (let skill of skills) {
      this.context.speciesSkills[skill] = 0;
    }

    for (let talent of talents) {

      // Set random talent count
      if (Number.isNumeric(talent)) {
        this.context.speciesTalents.randomTalents.talents.count = Number(talent);
      }

      // Comma means it's a choice
      else if (talent.includes(",")) {
        this.context.speciesTalents.choices.push(talent);
        this.context.speciesTalents.chosen.push("");
      }

      else
        this.context.speciesTalents.normal.push(talent);
    }

    for (let skill of this.data.items.career.system.skills) {
      this.context.careerSkills[skill] = 0;
    }

    for (let talent of this.data.items.career.system.talents) {
      this.context.careerTalents[talent] = false;
    }

    this.context.talentReplacement = talentReplacement;
    this.context.speciesTraits = traits;
  }

  get template() {
    return "systems/wfrp4e/templates/apps/chargen/skills-talents.hbs";
  }

  context = {
    speciesSkills: {},
    speciesTalents: {
      normal: [],
      chosen: [],
      choices: [],
      randomTalents: {}
    },
    speciesTraits : [],
    careerSkills: {},
    careerTalents: {},
  };

  async getData() {
    let data = await super.getData();

    data.speciesSkillAllocation = {
      0: [],
      3: [],
      5: []
    };

    /**#region species talents*/

    data.talents = {
      normal: this.context.speciesTalents.normal,
      random: this.#prepareRandomTalentData(),
      chosen: this.context.speciesTalents.chosen,

      // Separate choices ("Savvy,Suave") into {name : Suave, chosen : true/false}, {name : Savvy, chosen : true/false}
      choices: this.context.speciesTalents.choices.map((choice, index) => {
        return choice.split(",").map(i => {
          let name = i.trim();
          let tooltip = null;
          // matches `random[x]` and `random[x][key]` where `x` is a digit and `key` is a string
          let regex = /random\[(\d)](?:\[?([a-zA-Z-_]+)])?/i;
          let [match, amount, key] = name.match(regex) ?? [];
          amount = Number(amount);

          // Check if talent is an additional random (syntax => random[x] where x is the number of random talents to roll)
          if (match) {
            if (amount === 1)
              name = game.i18n.localize("CHARGEN.AdditionalRandomTalent");
            else
              name = game.i18n.format("CHARGEN.XAdditionalRandomTalents", { x: amount });

            // if table key was not specified, fall back to default table
            if (!key)
              key = 'talents';

            tooltip = this.context.speciesTalents.randomTalents[key]?.name;
          }

          let chosen = this.context.speciesTalents.chosen[index] === name;

          // If random is selected, add number to random talents to roll
          let table = this.context.speciesTalents.randomTalents[key];
          if (table && chosen) {
            table.left += Number(amount);
          }

          return {
            name,
            chosen,
            tooltip
          };
        });
      })
    };

    /**#endregion species talents*/

    // Sort into arrays
    for (let skill in this.context.speciesSkills) {
      data.speciesSkillAllocation[this.context.speciesSkills[skill]].push(skill);
    }

    // This case happens when user chose to roll an additional random talent, then changed their mind. Remove the extra talents
    for (let dataTable of data.talents.random) {
      if (dataTable.left < 0) {
        let table = this.context.speciesTalents.randomTalents[dataTable.key];
        let spliceIndex = table.talents.length - Math.abs(dataTable.left)
        table.talents.splice(spliceIndex);                    // Remove talents in context
        dataTable.talents.splice(spliceIndex);                // Reflect removed talents in template data
        dataTable.left = table.count - table.talents.length;  // Should be 0
      }
    }

    data.careerSkills = this.context.careerSkills;
    data.careerTalents = this.context.careerTalents;
    data.traits = this.context.speciesTraits;
    data.pointsAllocated = 40 - Object.values(this.context.careerSkills).reduce((prev, current) => prev + current, 0)
    
    return data;
  }

  /**
   * Prepare random talents data to be displayed in template, also check for duplicates
   *
   * @return {{key:string,name:string,count:number,left:number,rolled:boolean,talents:array}[]}
   */
  #prepareRandomTalentData() {
    // Convert table data from Map to Array for Handlebars
    let tablesArray = this.#getTalentTablesArray();
    let tables = tablesArray.map(t => {
      t.left = t.count - t.talents.length;
      t.talents = t.talents.map(i => {
        if (typeof i === 'object') return i;

        return {
          name : i,
          duplicate: false
        };
      });

      return t;
    });

    // Create a reference array of all talents across all tables for easy duplicate checking
    let allTalents = this.#reduceRandomTalents();
    // Add chosen talents (if they were chosen = not empty)
    allTalents.push(...this.context.speciesTalents.chosen.filter(t => t));

    // Check and mark duplicates
    tables.forEach(table => table.talents.forEach(talent => talent.duplicate = allTalents.filter(t => t === talent.name).length >= 2));

    return tables;
  }

  /**
   * Converts Random Talents Table Map to Array for easier mass operation handling
   *
   * @return {{key:string,name:string,count:number,left:number,rolled:boolean,talents:array}[]}
   */
  #getTalentTablesArray() {
    return Object.values(this.context.speciesTalents.randomTalents);
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

    let allTalents = [
      ...this.context.speciesTalents.normal,
      ...this.context.speciesTalents.chosen,
      ...this.#reduceRandomTalents(),
      careerTalent
    ];

    let talents = await Promise.all(allTalents.map(async i => {
      try {
        return await WFRP_Utility.findTalent(i);
      } catch(error) {
        // Ignore not found.
        // This is mainly important because when a user chooses "Additional Random Talent" as a talent, it won't be found
        warhammer.utility.log(`Talent ${i} was not found`, {error, context: this.context});
      }
    }));

    let traits = await Promise.all(this.context.speciesTraits.map(async i => {
      try {
        return await WFRP_Utility.findItem(i, "trait");
      } catch(error) {
        // Ignore not found.
        // This is mainly important because when a user chooses "Additional Random Talent" as a talent, it won't be found
        warhammer.utility.log(`Trait ${i} was not found`, {error, context: this.context});
      }
    }));

    this.data.items.talents = talents.filter(i => i);
    this.data.items.traits = traits.filter(i => i);
    super._updateObject(ev, formData)

  }

  /**
   * Reduces all random table data from complex Map to simple one-dimensional Array of Talent names
   *
   * @return {string[]}
   */
  #reduceRandomTalents() {
    let tables = this.#getTalentTablesArray();

    return tables.reduce((talents, table) => {
      talents.push(...table.talents.map(talent => talent.name));
      return talents;
    }, []);
  }

  async validate() {
    let valid = super.validate();

    if (!this.validateSkills())
      valid = false

    if (!this.#validateRandomSpeciesTalents()) {
      this.showError("SpeciesTalentsNotRolled")
      valid = false
    }

    if (this.context.speciesTalents.chosen.filter(i => i).length < this.context.speciesTalents.choices.length) {
      this.showError("SpeciesTalentsNotChosen")
      valid = false
    }

    if (Object.values(this.context.careerTalents).every(i => i == false)) {
      this.showError("CareerTalentNotChosen")
      valid = false
    }

    if (Object.values(this.context.careerSkills).reduce((prev, current) => prev + current, 0) > 40) {
      this.showError("CareerSkillAllocation")
      valid = false
    }

    return valid
  }

  #validateRandomSpeciesTalents() {
    return !this.#getTalentTablesArray().some(table => table.left > 0 || (table.count > 0 && table.rolled === false));
  }

  validateSkills() {
    let skills = Object.values(this.context.speciesSkills)
    let threes = skills.filter(i => i == 3).length
    let fives = skills.filter(i => i == 5).length

    if (threes > 3 || fives > 3) {
      this.showError("SpeciesSkillAdvancements")
      return false
    }
    else return true
  }



  activateListeners(html) {
    super.activateListeners(html);
    const dragDrop = new foundry.applications.ux.DragDrop.implementation({
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
      if (ev.currentTarget.value > 10) {
        ev.currentTarget.value = 0;
        this.showError("CareerSkillAllocationBounds")
      }
      this.context.careerSkills[ev.currentTarget.dataset.skill] = Number(ev.currentTarget.value);
      this.render(true);
    });

    html.find(".reroll-duplicate").click(async ev => {
      ev.stopPropagation();
      let index = Number(ev.currentTarget.dataset.index);
      let key = ev.currentTarget.dataset.table;
      let table = this.context.speciesTalents.randomTalents[key];

      let talent = await game.wfrp4e.tables.rollTable(table.key);
      talent = await this.checkTalentReplacement(talent.text);
      table.talents[index] = talent;
      this.updateMessage("RerolledDuplicateTalent", { rolled: talent })
      this.render(true);
    })
  }


  onDropSkill(ev) {
    let skill = JSON.parse(ev.dataTransfer.getData("text/plain")).skill;
    this.context.speciesSkills[skill] = Number(ev.currentTarget.dataset.advance);
    if (!this.validateSkills()) {
      this.context.speciesSkills[skill] = 0
    }

    this.render(true);
  }

  onDragSkill(ev) {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ skill: ev.currentTarget.textContent.trim() }));
  }

  async rollRandomTalents(ev) {
    let number = Number(ev.currentTarget.dataset.number) || 0;
    let key = ev.currentTarget.dataset.table || "talents";
    let table = this.context.speciesTalents.randomTalents[key];
    if (!table) return;

    for (let i = 0; i < number; i++) {
      let talent = await game.wfrp4e.tables.rollTable(table.key);
      talent = await this.checkTalentReplacement(talent.text);
      table.talents.push(talent);
    }

    table.rolled = true;
    this.updateMessage("Rolled", { rolled: table.talents.join(", ") })
    this.render(true);
  }

  async checkTalentReplacement(talent){
    if (this.context.talentReplacement[talent]) {
      let choice = await foundry.applications.api.DialogV2.confirm.confirm({
        window : {title: game.i18n.localize("CHARGEN.SkillsTalents.ReplaceTalentDialog.Title")},
        content: game.i18n.format("CHARGEN.SkillsTalents.ReplaceTalentDialog.Content", {talent, replacement: this.context.talentReplacement[talent]})
      });

      if (choice) {
        this.updateMessage("ReplacedTalent", {talent, replacement: this.context.talentReplacement[talent]})
        return this.context.talentReplacement[talent];
      }
    }

    return talent
  }
}
