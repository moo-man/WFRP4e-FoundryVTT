import NameGenWfrp from "./name-gen.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";


/**
 * This class is the center of character generation through the chat prompts (started with /char)
 * Each function usually corresponds with a specific action/button click, processing and rendering
 * a new card in response.
 */
export default class CharGenWfrp4e extends Application{
  constructor()
  {
    super();
    this.data ={
      species : null,
      subspecies: null,
      exp : {
        species : 0,
        characteristics : 0,
        career : 0
      },
      items : {
        career : null,
      },
      characteristics : {
        ws : 0,
        bs : 0,
        s : 0,
        t : 0,
        i : 0,
        ag : 0,
        dex : 0,
        int : 0,
        wp : 0,
        fel : 0,
      },
      fate : {base : 0, allotted : 0 },
      resilience : {base : 0, allotted : 0 },
      move : 4
    }
    this.stage = -1;
    this.stages = [
      {
        app : new SpeciesStage(this.data),
        completed : false
      },
      {
        app : new CareerStage(this.data),
        completed : false
      },
      {
        app : new AttributesStage(this.data),
        completed : false
      },
      {
        app : { options: {title : game.i18n.localize("CHARGEN.StageSkillsTalents")}},//new AttributesStage(this.data, this.next.bind(this), this.update.bind(this)),
        completed : false
      },
      {
        app : { options: {title : game.i18n.localize("CHARGEN.StageTrappings")}},//new AttributesStage(this.data, this.next.bind(this), this.update.bind(this)),
        completed : false
      },
      {
        app : { options: {title : game.i18n.localize("CHARGEN.StageDetails")}},//new AttributesStage(this.data, this.next.bind(this), this.update.bind(this)),
        completed : false
      }
    ]
  
    this.actor = {name : "", type : "character", system: game.system.model.Actor.character, items : []}
  }


  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "chargen";
    options.template = "systems/wfrp4e/templates/apps/chargen/chargen.html"
    options.classes = options.classes.concat("wfrp4e", "chargen");
    options.resizable = true;
    options.width = 1000;
    options.height = 600;
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.Title")
    return options;
}


  async getData() {
    return {stages : this.stages}
  }

  activateListeners(html)
  {
    super.activateListeners(html);
    // this.stages.forEach(stage => {
    //   stage.activateListeners(html)
    // })


    html.find(".chargen-button").on("click", ev => {
      this.stages[Number(ev.currentTarget.dataset.stage)].app.render(true);
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


class ChargenStage extends FormApplication
{
  active = false;
  html = "";
  data = {};
  context = {};

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.id = "chargen-stage"
    options.classes = options.classes.concat("wfrp4e", "chargen");
    options.width = 1000;
    options.height = 600;
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.Title")
    return options;
}

constructor(object, options)
{
  super(object, options);
  this.data = object;
}

  async getData() {
    return {data : this.data, context : this.context}
  }

  validate() {
    return false
  }

  _updateObject(event, formData)
  {

  }

  activateListeners(html)
  {
    super.activateListeners(html);
    html.on("click", '.chargen-button, .chargen-button-nostyle', this.onButtonClick.bind(this))
  }


  onButtonClick(ev)
  {
    let type = ev.currentTarget.dataset.button;
    if (typeof this[type] == "function")
    {
      this[type](ev);
    }
  }



}

class SpeciesStage extends ChargenStage
{
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 450;
    options.height = 400;
    options.classes.push("species")
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.StageSpecies")
    return options;
  }

  
  get template() {
    return "systems/wfrp4e/templates/apps/chargen/species-select.html";
  } 


  context = {
    species: "",
    subspecies : "",
    exp : 0
  }


  async getData() {
    let data = await super.getData();

    data.context = this.context;
    data.speciesDisplay = game.wfrp4e.config.species[this.context.species]

    if (this.context.species && game.wfrp4e.config.subspecies[this.context.species])
    {
      data.subspeciesChoices = game.wfrp4e.config.subspecies[this.context.species]
    }

    if (this.context.subspecies)
    {
      data.speciesDisplay += ` (${game.wfrp4e.config.subspecies[this.context.species][this.context.subspecies]?.name})`
    }

    return data
  }


  /**
   * The user is allowed to freely click and choose species, but can only roll for it one time.
   * After species is rolled, user can click and choose a different species, but cannot go back and roll again
   */
  activateListeners(html)
  {
    super.activateListeners(html)
    html.on("click", '.species-select', this.onSelectSpecies.bind(this))
    html.on("click", '.subspecies-select', this.onSelectSubspecies.bind(this))
  }


  // Set roll, unselect whatever user has chosen
  async onRollSpecies(event) {
    event.stopPropagation();
    this.context.exp = 20;
    this.context.roll = await game.wfrp4e.tables.rollTable("species");
    this.context.choose = false
    this.setSpecies(this.context.roll.species);
  }

  // Set chosen species, but don't unset "roll" (prevents users from rolling again after they've rolled once)
  onSelectSpecies(event) {
    this.context.exp = 0;
    this.context.choose = event.currentTarget.dataset.species;
    this.setSpecies(this.context.choose);
  }

  
  onSelectSubspecies(event) {
    this.setSpecies(this.context.species, event.currentTarget.dataset.subspecies)
  }


  _updateObject(event, formData)
  {
    this.data.species = this.context.species;
    this.data.subspecies = this.context.subspecies;
    this.data.exp.species = this.context.exp;
  }


  setSpecies(species, subspecies)
  {
    this.context.species = species
    if (subspecies)
    {
      this.context.subspecies = subspecies
    }
    else if (Object.keys(game.wfrp4e.config.subspecies[species] || {})?.length == 1)
    {
      this.context.subspecies = Object.keys(game.wfrp4e.config.subspecies[species])[0]
    }
    else {
      this.context.subspecies = ""
    }
    this.render(true)
  }

}

class CareerStage extends ChargenStage
{
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 300;
    options.height = 800;
    options.classes.push("career")
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.StageCareer")
    return options;
  }

  constructor(...args)
  {
    super(...args)
    this.context.step = 0
    this.context.careers = [];
    this.context.career = null;
    this.context.exp = 0;
  }


  get template() {
    return "systems/wfrp4e/templates/apps/chargen/career.html";
  }


  async rollCareers(event) {
    this.context.step++

    // First step, roll 1 career
    if (this.context.step == 1)
    {
      this.context.exp = 50;
      await this.addCareerChoice()

    }
    // Second step, Roll 2 more careers
    if(this.context.step == 2)
    {
      this.context.exp = 25
      await this.addCareerChoice(2)
    }
    // Third step, keep rolling careers
    if (this.context.step >= 3)
    {
      this.context.exp = 0
      await this.addCareerChoice()
    }
  }

  _updateObject(event, formData)
  {
    this.data.items.career = this.context.career
    this.data.exp.career = this.context.exp;
  }



  // Roll and add one more career choice
  async addCareerChoice(number = 1) {

    // Find column to roll on for caeer
    let rollSpecies = this.data.species
    if (this.data.species == "human" && !this.data.subspecies)
      this.data.subspecies = "reiklander"
    if (this.data.subspecies && game.wfrp4e.tables.findTable("career", rollSpecies + "-" + this.data.subspecies))
      rollSpecies += "-" + this.data.subspecies

    for(let i = 0; i < number; i++)
    {
      let newCareerRolled = await game.wfrp4e.tables.rollTable("career", {}, rollSpecies)
      let newCareerName = newCareerRolled.text;
      this.context.careers = this.context.careers.concat(await this.findT1Careers(newCareerName))
      for (let c of this.context.careers) {
        c.enriched = await TextEditor.enrichHTML(c.system.description.value, {async: true})
      }
    }
    this.render(true)
  }


  // Choose career shows the career list for the user to choose which career they want
  async chooseCareer() {
    this.context.choose = true;
    this.context.exp = 0
    this.context.careerList = []
    this.context.step++;

    let rollSpecies = this.data.species;
    let table = game.wfrp4e.tables.findTable("career", rollSpecies)
    if (this.data.subspecies && game.wfrp4e.tables.findTable("career", rollSpecies + "-" + this.data.subspecies))
    {
      rollSpecies += "-" + this.data.subspecies
      table = game.wfrp4e.tables.findTable("career", rollSpecies)
    }
    for (let r of table.results) {
        this.context.careerList.push(WFRP_Utility.extractLinkLabel(r.text));
    }
    this.render(true);
  }


  // Career selected, move on to the next step
  async selectCareer(ev) {
    let careerItem = await this.findT1Careers(ev.currentTarget.dataset.career)
    if (careerItem)
    {
      this.context.career = careerItem[0]
    }
    else 
    {
      throw new Error("Cannot find Tier 1 Career Item " + ev.currentTarget.dataset.career)
    }
    this.render(true)
  }

    /**
     * Given a career name, find the T1 item for that career
     * "Witch Hunter" -> Interrogator Item
     * 
     * @param {String} careerName Name of career to be posted
     */
    async findT1Careers(careerNames) {

      if (typeof careerNames == "string")
        careerNames = [careerNames]

      let packs = game.wfrp4e.tags.getPacksWithTag("career")
      let careers = game.items.filter(i => i.type == "career")
      let careersFound = [];
  
      for(let pack of packs)
        careers = careers.concat((await pack.getDocuments()).filter(i => i.type == "career"));
  
      // Find the tier 1 rank that corresponds with the career name
      for (let c of careers) {
        if (careerNames.includes(c.system.careergroup.value) && c.system.level.value == 1)
          careersFound.push(c)
        if (careersFound.length == careerNames.length)
          break;
      }
  
      if (careerNames.length != careersFound.length)
        ui.notifications.error(`${careerNames.length - careersFound.length} career Items could not be found (out of ${careerNames.toString()})`)
      return careersFound
    }  
}

class AttributesStage extends ChargenStage 
{

    static get defaultOptions() {
      const options = super.defaultOptions;
      options.resizable = true;
      options.width = 400;
      options.height = 600;
      options.classes.push("career")
      options.minimizable = true;
      options.title = game.i18n.localize("CHARGEN.StageAttributes")
      return options;
    }

  
  get template() {return  "systems/wfrp4e/templates/apps/chargen/attributes.html"}

  constructor(...args)
  {
    super(...args)

    // Step 1: First roll, Step 2: Swapping, Step 3: Reroll & Swapping, Step 4: Allocating 
    this.context.step = 0
    this.context.characteristics = {
      ws : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      bs : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      s : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      t : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      i : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      ag : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      dex : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      int : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      wp : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
      fel : {formula : "", roll : 0, add : 0, total: 0, allocated : 0},
    },
    this.context.allocation = {
      total : 100,
      spent : 0
    }
    this.context.meta = {
      fate : {base : 0, allotted : 0, total : 0},
      resilience : {base : 0, allotted : 0, total : 0},
      extra : 0,
      left : 0
    }
    this.context.move = 4;
    this.context.exp = 50
  }

  async getData() {
    let data = await super.getData()
    if (this.context.step <= 1)
    {
      this.context.exp = 50
    }
    else if (this.context.step == 2)
    {
      this.context.exp = 25;
    }
    else 
      this.context.exp = 0;
    return data
  }

   async rollAttributes(ev, step) {
    if (step)
      this.context.step = step
    else
      this.context.step++;
    let species = this.data.species
    let subspecies = this.data.subspecies

    let characteristicFormulae = game.wfrp4e.config.speciesCharacteristics[species];
    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].characteristics)
      characteristicFormulae = game.wfrp4e.config.subspecies[species][subspecies].characteristics

    for(let ch in this.context.characteristics)
    {
      let [roll, bonus] = characteristicFormulae[ch].split("+").map(i => i.trim())
      roll = roll || "2d10";
      bonus = bonus || 0
      this.context.characteristics[ch].formula = characteristicFormulae[ch]
      this.context.characteristics[ch].roll = (await new Roll(roll).roll()).total;
      this.context.characteristics[ch].add = bonus;
      this.context.characteristics[ch].allocated = 0;
    }

    this.context.movement = game.wfrp4e.config.speciesMovement[species],
    this.context.meta.fate.base = game.wfrp4e.config.speciesFate[species],
    this.context.meta.resilience.base =  game.wfrp4e.config.speciesRes[species],
    this.context.meta.extra =  game.wfrp4e.config.speciesExtra[species]


    this.calculateTotals();
    this.render();
  }

  calculateTotals() {
    this.context.allocation.spent = 0;
    for(let ch in this.context.characteristics)
    {
      let characteristic = this.context.characteristics[ch]
      characteristic.total = Number((characteristic.allocated || characteristic.roll)) + Number(characteristic.add);
      this.context.allocation.spent += characteristic.allocated;
    }
    let fate = this.context.meta.fate
    let resilience = this.context.meta.resilience
    fate.total = fate.base + fate.allotted
    resilience.total = resilience.base + resilience.allotted
    this.context.meta.left = this.context.meta.extra - (resilience.allotted + fate.allotted)
  }

  swap(ch1, ch2)
  {
    if (this.context.step < 2)
      this.context.step = 2;
    let ch1Roll = duplicate(this.context.characteristics[ch1].roll)
    let ch2Roll = duplicate(this.context.characteristics[ch2].roll)

    this.context.characteristics[ch1].roll = ch2Roll
    this.context.characteristics[ch2].roll = ch1Roll

    this.calculateTotals();
    this.render(true);
  }
  
  activateListeners(html)
  {
    super.activateListeners(html);
    const dragDrop = new DragDrop({
      dragSelector: '.ch-roll',
      dropSelector: '.ch-roll',
      permissions: { dragstart: () => true, drop: () => true },
      callbacks: { drop: this.onDropCharacteristic.bind(this), dragstart : this.onDragCharacteristic.bind(this) },
    });

    dragDrop.bind(html[0]);


    html.find(".meta input").on("change", (ev) => {
      this.context.meta[ev.currentTarget.dataset.meta].allotted = Number(ev.currentTarget.value)
      this.calculateTotals();
      this.render(true);
    })

    html.find(".ch-allocate").on("change", (ev) => {
      this.context.characteristics[ev.currentTarget.dataset.ch].allocated = Number(ev.currentTarget.value)
      this.calculateTotals();
      this.render(true);
    })
  }

  reroll(ev)
  {
    // Set to step 3
    this.rollAttributes(ev, 3)
  }

  allocate(ev)
  {
    this.context.step = 4
    this.render(true);
  }

  _updateObject()
  {
    for(let ch in this.context.characteristics)
    {
      this.data.characteristics[ch] = this.context.characteristics[ch].total
    }
    this.data.fate = this.context.meta.fate.total
    this.data.resilience = this.context.meta.resilience.total
    this.data.move = game.wfrp4e.config.speciesMovement[this.data.species]
    this.data.exp.characteristics = this.context.exp
  }

  onDragCharacteristic(ev)
  {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ch : ev.currentTarget.dataset.ch}));
  }

  onDropCharacteristic(ev)
  {
    if (ev.currentTarget.dataset.ch)
    {
      let ch = JSON.parse(ev.dataTransfer.getData("text/plain")).ch
      this.swap(ev.currentTarget.dataset.ch, ch)
    }
  }
    
}