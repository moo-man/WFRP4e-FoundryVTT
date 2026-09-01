export class CareerStage extends BaseCharacterCreationStage
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
                rollCareer: this._onRollCareer,
                chooseCareer: this._onChooseCareer,
                selectCareer: this._onSelectCareer
            }
        };

    static PARTS = {
        career : {template : "systems/wfrp4e/templates/apps/chargen/v2/stages/career.hbs", scrollable: [".table-content"]},
        result : {
          template : "systems/wfrp4e/templates/apps/chargen/v2/stage-result.hbs"
        }
    };

    handleStageArgs(species)
    {
        this.data.species = new Item.implementation(species);
        this.data.table = this.data.species.system.tables.career.document;
        this.data.careers = warhammer.utility.findAllItems("career", "Loading Careers", true, ["id", "system.careergroup.value", "system.level.value"]);
        this.data.step = 0;
        this.data.careerChoices = [];
        this.data.selected = null;
        this.data.replacements = [];
        this.data.xp = null;
        this.data.manuallyChosen = null;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.table = await this.data.table;
        context.careerChoices = this.data.careerChoices;
        context.selectedCareer = await warhammer.utility.findItemId(this.data.selected ?? "");
        context.manuallyChosen = this.data.manuallyChosen;
        return context;
    }

    async _preparePartContext(partId, context, options) {
      await super._preparePartContext(partId, context, options);
      if (partId == "result")
      {
        context.label = "Career";
        context.result = context.selectedCareer?.name;
        context.xp = this._computeXP();
      }
      return context;
    }

    async _onRender(options)
    {
        await super._onRender(options)
        let selectedCareer = await warhammer.utility.findItemId(this.data.selected ?? "");
        if (selectedCareer)
        {
            let careersInGroup = (await this.data.careers).filter(c => c.system.careergroup.value == selectedCareer.system.careergroup.value);
            let careerHTML = await selectedCareer.system.toEmbed({tiers: careersInGroup.filter(i => i._id != selectedCareer.id).map(i => i.uuid).join(",")});
            let div = document.createElement("div");
            div.classList.add("wfrp4e-embed", "career");
            div.appendChild(careerHTML);
            this.element.querySelector(".career-details").appendChild(div);
        }
    }

    
    async getStageResults() 
    {
        return {
            items: [await warhammer.utility.findItemId(this.data.selected)].map(i => i.toObject()),
            "system.details.experience.current" : this._computeXP()
        }
    }

    async addCareerChoice(number = 1) {

        for (let i = 0; i < number; i++) 
        {
          let careerResult = await this.rollCareerTable()
          let careerName = careerResult.results[0].name;
    
          // Some books that add careers define replacement options, such as (If you roll career X you can use this new career Y (e.g. Soldier to Ironbreaker))
          // If there's a replacement option for a given career, add that replacement career too
          let replacementOptions = game.wfrp4e.config.speciesCareerReplacements[this.data.species]?.[careerName] || []
        //   replacementOptions = replacementOptions.concat(game.wfrp4e.config.speciesCareerReplacements[`${this.data.species}-${this.data.subspecies}`]?.[careerName] || [])
    
          let t1Careers = await this.findT1Careers(careerName)
          
          this.data.careerChoices = this.data.careerChoices.concat(t1Careers);
          if (replacementOptions.length > 0)
          {
            let replacements = await this.findT1Careers(replacementOptions)
            this.data.replacements = this.data.replacements.concat(replacements)
          }
    
          this.updateMessage("Rolled", {rolled : t1Careers.map(i => i.name).join(", ")})
        }
        this.render({force: true});
      }


  /**
   * Rolls on a career table based on provided species
   * Separated into its own function to cleanly overwrite in modules
   * 
   * @param {String} species Species table to roll on
   * @returns 
   */
  async rollCareerTable()
  {
    return (await this.data.table).roll();
  }
      
    /**
   * Given a career name, find the T1 item for that career
   * "Witch Hunter" -> Interrogator Item
   *
   * @param {String} careerName Name of career to be posted
   */
    async findT1Careers(careerNames) {

        let careers = await this.data.careers
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

    _computeXP()
    {
      if (!this.data.manuallyChosen || this.data.careerChoices.find(i => i._id == this.data.selected))
      {
        return this.data.xp;
      }
      else 
      {
        return 0;
      }
    }
    

    static async _onRollCareer(ev, target)
    {
        this.data.step++;

        // First step, roll 1 career
        if (this.data.step == 1) {
          this.data.xp = 50;
          await this.addCareerChoice();
          // QoL: Upon the first career roll, automatically set the selected career to it
          this.data.selected = this.data.careerChoices[0]._id;
        }
        // Second step, Roll 2 more careers
        if (this.data.step == 2) {
          this.data.xp = 25;
          await this.addCareerChoice(2);
        }
        // Third step, keep rolling careers
        if (this.data.step >= 3) {
          this.data.xp = 0;
          await this.addCareerChoice();
        }
    }

    static async _onChooseCareer(ev, target)
    {
        let id = target.dataset.id;
        // let career = await fromUuid(uuid);
        this.data.manuallyChosen = id;
        let result = (await this.data.table).results.get(id);
        let t1Career = (await this.findT1Careers(result.name))[0];

        this.data.selected = t1Career._id;

        // // If chosen a species you rolled, don't consider it chosen
        // if (uuid == this.data.rolled)
        // {
        //     delete this.data.chosen;
        //     this.render({force: true});
        //     return;
        // }


        if (!career)
        {
            throw new Error(game.i18n.localize("CHARGEN.ERROR."))
        }
        else 
        {
            this.render({force: true});
        }
    }

    static async _onSelectCareer(ev, target)
    {
        this.data.selected = target.dataset.id;
        this.data.manuallyChosen = null;
        this.render({force: true});
    }
}





