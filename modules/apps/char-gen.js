import NameGenWfrp from "./name-gen.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";


/**
 * This class is the center of character generation through the chat prompts (started with /char)
 * Each function usually corresponds with a specific action/button click, processing and rendering
 * a new card in response.
 */
export default class GeneratorWfrp4e {

  constructor()
  {
    this.species;
    this.speciesExp = 0
    this.attributeExp = 0
    this.careerExp = 0
    this.subspecies;
  }
  /**
   * The species stage is the first stage of character generation.
   * Displays the list of species with an option to roll, or select
   * a specific species.
   */

  static start()
  {
    game.wfrp4e.generator = new this()
  }

  speciesStage() {
    if (! game.wfrp4e.config.species)
      return ui.notifications.error("No content found")

    renderTemplate("systems/wfrp4e/templates/chat/chargen/species-select.html", { species:  game.wfrp4e.config.species }).then(html => {
      let chatData = WFRP_Utility.chatDataSetup(html)
      ChatMessage.create(chatData);
    })
  }

  /**
   * This function is the response to the "Roll Species" button or specifically clicking on a species to select it.
   * 
   * If species was chosen, the this.chosenSpecies argument is used, and no exp is given. Update the species selection
   * menu with the choice/roll result.
   * 
   * @param {String} messageId ID of the species selection menu chat card
   */
  async rollSpecies(messageId, chosenSpecies) {
    let roll;
    if (chosenSpecies) {
      this.speciesExp = 0;
      roll = { roll: game.i18n.localize("Choose"), species: chosenSpecies, name:  game.wfrp4e.config.species[chosenSpecies]}
    }
    else {
      this.speciesExp = 20;
      roll = await game.wfrp4e.tables.rollTable("species");
    }

    this.species = roll.species

    let speciesMessage = game.messages.get(messageId)
    let updateCardData = { roll: roll, species:  game.wfrp4e.config.species }

    // Update the species selection menu to show what was rolled/chosen
    renderTemplate("systems/wfrp4e/templates/chat/chargen/species-select.html", updateCardData).then(html => {
      speciesMessage.update({ content: html })
    })

    if (game.wfrp4e.config.subspecies[roll.species])
    {
      return renderTemplate("systems/wfrp4e/templates/chat/chargen/subspecies-select.html", { species: roll.species, speciesDisplay : game.wfrp4e.config.species[roll.species], subspecies:  game.wfrp4e.config.subspecies[roll.species]}).then(html => {
        let chatData = WFRP_Utility.chatDataSetup(html)
        ChatMessage.create(chatData);
      })
    }

    // Once a species is selected/rolled, display characteristics rolled
    this.rollAttributes()
  }

  chooseSubspecies(subspecies)
  {
    this.subspecies = subspecies
    this.rollAttributes()
  }

  /**
   * Display species characteristics + other attributes for the user to drag and drop onto their sheet.
   * 
   * Also displays buttons to continue character generation.
   * 
   * @param {String} species speciesKey for species selected
   * @param {Number} exp Experience received from random generation
   */
  async rollAttributes(reroll = false) {
    let species = this.species
    let characteristics = await WFRP_Utility.speciesCharacteristics(species, false, this.subspecies)
    
    if (reroll) {
        this.attributeExp = 0
    }
    else
      this.attributeExp = 50


    // Setup the drag and drop payload
    let dataTransfer = {
      type : "generation",
      generationType: "attributes",
      payload : {
        species,
        subspecies : this.subspecies,
        characteristics: characteristics,
        movement:  game.wfrp4e.config.speciesMovement[species],
        fate:  game.wfrp4e.config.speciesFate[species],
        resilience:  game.wfrp4e.config.speciesRes[species],
        exp: this.attributeExp + this.speciesExp
      }
    }
    let cardData = duplicate(dataTransfer.payload)

    // Turn keys into abbrevitaions (ws -> WS) for more user friendly look
    cardData.characteristics = {}
    for (let abrev in  game.wfrp4e.config.characteristicsAbbrev) {
      cardData.characteristics[ game.wfrp4e.config.characteristicsAbbrev[abrev]] = dataTransfer.payload.characteristics[abrev]
    }
    cardData.speciesKey = species;
    cardData.species = game.wfrp4e.config.species[species]
    if (this.subspecies)
      cardData.species += ` (${game.wfrp4e.config.subspecies[species][this.subspecies].name})`
    cardData.extra =  game.wfrp4e.config.speciesExtra[species]
    cardData.move =  game.wfrp4e.config.speciesMovement[species]

    renderTemplate("systems/wfrp4e/templates/chat/chargen/attributes.html", cardData).then(html => {
      let chatData = WFRP_Utility.chatDataSetup(html)
      chatData["flags.transfer"] = JSON.stringify(dataTransfer);
      ChatMessage.create(chatData);
    });
  }

  /**
   * Shows the list of skills and talents for a species that the user can drag and drop
   * onto their sheet.
   * 
   * @param {String} species Species key to determine which skills/talents to display
   * @param {Number} exp Exp from random generation so far
   */
  async speciesSkillsTalents() {
    let species = this.species
    let {skills, talents} = WFRP_Utility.speciesSkillsTalents(this.species, this.subspecies)

    let cardData = {
      speciesKey: species,
      species:  game.wfrp4e.config.species[species],
      speciesSkills:  skills,
    }

    let speciesTalents = []
    let choiceTalents = []

    // Determine which talents to display as a choice
     talents.forEach(talent => {
      if (isNaN(talent)) {
        let talentList = talent.split(",").map(i => i.trim())
        if (talentList.length == 1)
          speciesTalents.push(talentList[0])
        else
          choiceTalents.push(talentList)
      }
    })
    // Last 'talent' in the species talent array is a number denoting random talents.
    let randomTalents =  talents[talents.length - 1]
    cardData.randomTalents = []
    for (let i = 0; i < randomTalents; i++)
    {
      let talent = await game.wfrp4e.tables.rollTable("talents")
      cardData.randomTalents.push({ name: talent.result, roll : talent.roll})
    }

    cardData.speciesTalents = speciesTalents;
    cardData.choiceTalents = choiceTalents;
    renderTemplate("systems/wfrp4e/templates/chat/chargen/species-skills-talents.html", cardData).then(html => {
      let chatData = WFRP_Utility.chatDataSetup(html)
      ChatMessage.create(chatData);
    })
  }

  /**
   * Roll a career and display the instructions, as well as post the career to chat.
   * 
   * @param {String} species Species key
   * @param {Number} exp Exp value to show
   * @param {Boolean} isReroll Whether this career is from a reroll
   */
  async rollCareer(isReroll=false) {
    this.careerExp = 0
    if (isReroll)
      this.careerExp = game.wfrp4e.config.randomExp.careerReroll
    else
      this.careerExp = game.wfrp4e.config.randomExp.careerRand
    
    let rollSpecies = this.species
    if (this.species == "human" && !this.subspecies)
      this.subspecies = "reiklander"
    if (this.subspecies && game.wfrp4e.tables.findTable("career", rollSpecies + "-" + this.subspecies))
      rollSpecies += "-" + this.subspecies
    let roll = await game.wfrp4e.tables.rollTable("career", {}, rollSpecies)
    this.displayCareer(roll.object.text, isReroll)
  }

  /**
   * Show the list of available to careers to choose from if the user does not want to roll.
   * 
   * @param {String} species species key
   */
  async chooseCareer() {
    let msgContent = `<h2>${game.i18n.localize("CHAT.CareerChoose")}</h2>`;
    let rollSpecies = this.species;
    if (this.subspecies && game.wfrp4e.tables["career"].multi.includes(rollSpecies + "-" + this.subspecies))
      rollSpecies += "-" + this.subspecies
    for (let r of game.wfrp4e.tables.career.rows) {
      if (r.range[rollSpecies].length)
        msgContent += `<a class="career-select" data-career="${r[rollSpecies].name}" data-species="${this.species}">${r[rollSpecies].name}</a><br>`
    }

    let chatData = WFRP_Utility.chatDataSetup(msgContent)
    ChatMessage.create(chatData);

  }

  /**
   * This displays the career rolled, but instead of displaying the tier 2 rank that matches the name,
   * it finds the tier 1 rank and posts that.
   * 
   * @param {String} careerName Name of career to be posted
   * @param {String} species Species key
   * @param {Boolean} isReroll if this career is from a reroll
   * @param {Boolean} isChosen if this career was chosen instead of rolled
   */
  async displayCareer(careerName, isReroll, isChosen) {
    let pack = game.packs.find(p => p.metadata.name == "careers")
    let careers = await pack.getDocuments();
    let careerFound;
    // Find the tier 1 rank that corresponds with the career name
    for (let c of careers) {
      if (c.data.data.careergroup.value == careerName && c.data.data.level.value == 1)
        careerFound = c
      if (careerFound)
        break;
    }
    // Post the career
    careerFound.postItem()

    let cardData = {
      exp: this.careerExp,
      reroll: isReroll,
      chosen: isChosen,
      speciesKey: this.species,
      trappings:  game.wfrp4e.config.classTrappings[WFRP_Utility.matchClosest( game.wfrp4e.config.classTrappings, careerFound.data.data.class.value, {matchKeys: true})] // Match closest is needed here (Academics/Academic)
    }

    // Show card with instructions and button
    renderTemplate("systems/wfrp4e/templates/chat/chargen/career-select.html", cardData).then(html => {
      let chatData = WFRP_Utility.chatDataSetup(html)
      ChatMessage.create(chatData);
    })
  }



  /**
   * Generate details (hair/eye color, height, etc.) and display on a draggable card.
   * 
   * @param {String} species Species key
   */
  async rollDetails(species) {
    species = species || this.species 
    let name, eyes, hair, heightRoll, hFeet, hInches, age

    // Generate name, age, eyes, hair, height
    name = NameGenWfrp.generateName({ species: species })
    if (!name)
      name = species + " names TBD"
    eyes = (await game.wfrp4e.tables.rollTable("eyes", {}, species)).result
    hair = (await game.wfrp4e.tables.rollTable("hair", {}, species)).result

    age = (await new Roll( game.wfrp4e.config.speciesAge[species]).roll()).total;
    heightRoll = (await new Roll( game.wfrp4e.config.speciesHeight[species].die).roll()).total;
    hFeet =  game.wfrp4e.config.speciesHeight[species].feet;
    hInches =  game.wfrp4e.config.speciesHeight[species].inches + heightRoll;
    hFeet += Math.floor(hInches / 12)
    hInches = hInches % 12

    // Setup drag and drop values
    let dataTransfer = {
      type: "generation",
      generationType: "details",
      payload: {
        name: name,
        eyes: eyes,
        hair: hair,
        age: age,
        height: `${hFeet}'${hInches}`
      }
    }

    let cardData = {
      species:  game.wfrp4e.config.species[species],
      name: name,
      eyes: eyes,
      hair: hair,
      age: age,
      height: `${hFeet}'${hInches}`
    }

    renderTemplate(`systems/wfrp4e/templates/chat/chargen/details.html`, cardData).then(html => {
      let chatData = WFRP_Utility.chatDataSetup(html)
      chatData["flags.transfer"] = JSON.stringify(dataTransfer);
      ChatMessage.create(chatData);
    })
  }
}