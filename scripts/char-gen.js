/**
 * This class is the center of character generation through the chat prompts (started with /char)
 * Each function usually corresponds with a specific action/button click, processing and rendering
 * a new card in response.
 */
class GeneratorWfrp4e 
{
  /**
   * The species stage is the first stage of character generation.
   * Displays the list of species with an option to roll, or select
   * a specific species.
   */
  static speciesStage()
  {
    if (!WFRP4E.species)
      return ui.notifications.error("No content found")

    renderTemplate("systems/wfrp4e/templates/chat/chargen/species-select.html", {species : WFRP4E.species}).then(html => {
      let chatData = WFRP_Utility.chatDataSetup(html)
      ChatMessage.create(chatData);
    })
  } 

  /**
   * This function is the response to the "Roll Species" button or specifically clicking on a species to select it.
   * 
   * If species was chosen, the chosenSpecies argument is used, and no exp is given. Update the species selection
   * menu with the choice/roll result.
   * 
   * @param {String} messageId ID of the species selection menu chat card
   * @param {String} chosenSpecies Key of the species specifically chosen, if any. Null if rolled.
   */
  static rollSpecies(messageId, chosenSpecies = null)
  {
    let roll, exp;
    if (chosenSpecies)
    {
      exp = 0;
      roll = {roll: game.i18n.localize("Choose"), value : chosenSpecies, name : WFRP4E.species[chosenSpecies], exp : 0}
    }
    else
    {
      exp = 20;
      roll = WFRP_Tables.rollTable("species");
    }

    let speciesMessage = game.messages.get(messageId)
    let updateCardData = {roll : roll, species : WFRP4E.species}

    // Update the species selection menu to show what was rolled/chosen
    renderTemplate("systems/wfrp4e/templates/chat/chargen/species-select.html", updateCardData).then(html =>{
      speciesMessage.update({content: html})
    })
    // Once a species is selected/rolled, display characteristics rolled
    this.rollAttributes(roll.value, exp)
  }

  /**
   * Display species characteristics + other attributes for the user to drag and drop onto their sheet.
   * 
   * Also displays buttons to continue character generation.
   * 
   * @param {String} species speciesKey for species selected
   * @param {Number} exp Experience received from random generation
   */
  static rollAttributes(species, exp = 0, reroll = false)
  {
    let characteristics = WFRP_Utility.speciesCharacteristics(species, false)

    let calcExp = exp;
    if (reroll)
    {
      if (exp == 70)
        calcExp = exp-50;
    }
    else 
      calcExp = exp + 50;



    // Setup the drag and drop payload
    let dataTransfer = {
      generation : true,
      type : "attributes",
      payload : {
        species: WFRP4E.species[species],
        characteristics : characteristics,
        movement : WFRP4E.speciesMovement[species],
        fate : WFRP4E.speciesFate[species],
        resilience : WFRP4E.speciesRes[species],
        exp : calcExp
      }
    }

    let cardData = duplicate(dataTransfer.payload)

    // Turn keys into abbrevitaions (ws -> WS) for more user friendly look
    cardData.characteristics = {}
    for (let abrev in WFRP4E.characteristicsAbbrev)
    {
      cardData.characteristics[WFRP4E.characteristicsAbbrev[abrev]] = dataTransfer.payload.characteristics[abrev]
    }
    cardData.speciesKey = species;
    cardData.extra = WFRP4E.speciesExtra[species]
    cardData.move = WFRP4E.speciesMovement[species]

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
  static speciesSkillsTalents(species, exp)
  {
    let cardData = {
      speciesKey : species,
      species : WFRP4E.species[species],
      speciesSkills : WFRP4E.speciesSkills[species],
      exp : exp
    }

    let talents = []
    let choiceTalents = []

    // Determine which talents to display as a choice
    WFRP4E.speciesTalents[species].forEach(talent => {
        if (isNaN(talent))
        {
          let talentList = talent.split(", ")
          if (talentList.length == 1)
            talents.push(talentList[0])
          else
            choiceTalents.push(talentList)
        }
    })
    // Last 'talent' in the species talent array is a number denoting random talents.
    let randomTalents = WFRP4E.speciesTalents[species][WFRP4E.speciesTalents[species].length-1]
    cardData.randomTalents = []
    for (let i = 0; i < randomTalents; i++)
      cardData.randomTalents.push(WFRP_Tables.rollTable("talents").name)

    cardData.speciesTalents = talents;
    cardData.choiceTalents = choiceTalents;
    renderTemplate("systems/wfrp4e/templates/chat/chargen/species-skills-talents.html", cardData).then(html =>{
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
  static async rollCareer(species, exp, isReroll)
  {
    let roll = WFRP_Tables.rollTable("career", {}, species)
    this.displayCareer(roll.name, species, exp, isReroll)
  }
  
  /**
   * Show the list of available to careers to choose from if the user does not want to roll.
   * 
   * @param {String} species species key
   */
  static async chooseCareer(species)
  {
    let msgContent = `<h2>${game.i18n.localize("CHAT.CareerChoose")}</h2>`;
    for (let r of WFRP_Tables.career.rows)
    {
      if (r.range[species].length)
        msgContent+=`<a class="career-select" data-career="${r.name}" data-species="${species}">${r.name}</a><br>`
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
   * @param {Number} exp Exp from random generation
   * @param {Boolean} isReroll if this career is from a reroll
   * @param {Boolean} isChosen if this career was chosen instead of rolled
   */
  static async displayCareer(careerName, species, exp, isReroll, isChosen)
  {
    let pack = game.packs.find(p => p.metadata.name == "careers")
    let careers =  await pack.getContent();
    let careerFound;
    // Find the tier 1 rank that corresponds with the career name
    for (let c of careers)
    {
      if (c.data.data.careergroup.value == careerName && c.data.data.level.value == 1)
        careerFound = c
      if (careerFound)
        break;
    }
    // Post the career
    careerFound.postItem()

    let cardData = {
      exp : exp,
      reroll: isReroll,
      chosen : isChosen,
      speciesKey: species,
      trappings : WFRP4E.classTrappings[WFRP_Utility.matchClosest(WFRP4E.classTrappings, careerFound.data.data.class.value)] // Match closest is needed here (Academics/Academic)
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
  static async rollDetails(species)
  {
    let name, eyes, hair, heightRoll, hFeet, hInches, age

    // Generate name, age, eyes, hair, height
    name = NameGenWfrp.generateName({species : species})
    if (!name)
      name = species + " names TBD"
    eyes = WFRP_Tables.rollTable("eyes", {}, species).name
    hair = WFRP_Tables.rollTable("hair", {}, species).name

    age = new Roll(WFRP4E.speciesAge[species]).roll().total;
    heightRoll = new Roll(WFRP4E.speciesHeight[species].die).roll().total;
    hFeet = WFRP4E.speciesHeight[species].feet;
    hInches = WFRP4E.speciesHeight[species].inches + heightRoll;
    hFeet += Math.floor(hInches / 12)
    hInches = hInches % 12

    // Setup drag and drop values
    let dataTransfer = {
      generation : true,
      type : "details",
      payload : {
        name : name,
        eyes : eyes,
        hair : hair,
        age : age,
        height : `${hFeet}'${hInches}`
      }
    }
    
    let cardData = {
      species: WFRP4E.species[species],
      name : name,
      eyes : eyes,
      hair : hair,
      age : age,
      height : `${hFeet}'${hInches}`
    }

    renderTemplate(`systems/wfrp4e/templates/chat/chargen/details.html`, cardData).then(html => {
      let chatData = WFRP_Utility.chatDataSetup(html)
      chatData["flags.transfer"] = JSON.stringify(dataTransfer);
      ChatMessage.create(chatData);
    })
  }
}