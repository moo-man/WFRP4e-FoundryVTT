/**
 * Specialized class to consume and generate from a large list of human name options extracted from
 * http://www.windsofchaos.com/wp-content/uploads/encroachment/book-of-imperial-names.pdf
 * See the `names` folder in the system directory to examine the list of names and options.
 */
 import WFRP_Utility from "../system/utility-wfrp4e.js";


export default class NameGenWfrp {
  static _loadNames() {
    warhammer.utility.log("Loading Names...", true)

    // Surname option 1
    fetch("systems/wfrp4e/names/human_surnames.txt").then(r => r.text()).then(async nameText => {
      this.surnames = []
      nameText.split("\n").forEach((nameGroup) => this.surnames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })
    // Surname option 2 - prefix
    fetch("systems/wfrp4e/names/human_surnames_prefix.txt").then(r => r.text()).then(async nameText => {
      this.surnamePrefixes = []
      nameText.split("\n").forEach((nameGroup) => this.surnamePrefixes.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // Surname option 2 - suffix
    fetch("systems/wfrp4e/names/human_surnames_suffix.txt").then(r => r.text()).then(async nameText => {
      this.surnameSuffixes = []
      nameText.split("\n").forEach((nameGroup) => this.surnameSuffixes.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // Male forenames
    fetch("systems/wfrp4e/names/male_human_forenames.txt").then(r => r.text()).then(async nameText => {
      this.human_male_Forenames = []
      nameText.split("\n").forEach((nameGroup) => this.human_male_Forenames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // Female forenames
    fetch("systems/wfrp4e/names/female_human_forenames.txt").then(r => r.text()).then(async nameText => {
      this.human_female_Forenames = []
      nameText.split("\n").forEach((nameGroup) => this.human_female_Forenames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // @@@@@@@@@@ DWARF @@@@@@@@@@@@@
    // male forenames
    fetch("systems/wfrp4e/names/male_dwarf_forenames.txt").then(r => r.text()).then(async nameText => {
      this.dwarf_male_Forenames = []
      nameText.split("\n").forEach((nameGroup) => this.dwarf_male_Forenames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // Female forenames
    fetch("systems/wfrp4e/names/female_dwarf_forenames.txt").then(r => r.text()).then(async nameText => {
      this.dwarf_female_Forenames = []
      nameText.split("\n").forEach((nameGroup) => this.dwarf_female_Forenames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // @@@@@@@@@@ ELF @@@@@@@@@@@@@
    // elf forenames
    fetch("systems/wfrp4e/names/elf_forenames.txt").then(r => r.text()).then(async nameText => {
      this.elf_Forenames = []
      nameText.split("\n").forEach((nameGroup) => this.elf_Forenames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    fetch("systems/wfrp4e/names/elf_surnames.txt").then(r => r.text()).then(async nameText => {
      this.elf_surnames = []
      nameText.split("\n").forEach((nameGroup) => this.elf_surnames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })
    // elf start
    fetch("systems/wfrp4e/names/elf_start.txt").then(r => r.text()).then(async nameText => {
      this.elf_start = []
      nameText.split("\n").forEach((nameGroup) => this.elf_start.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // elf connector
    fetch("systems/wfrp4e/names/elf_connectors.txt").then(r => r.text()).then(async nameText => {
      this.elf_connectors = []
      nameText.split("\n").forEach((nameGroup) => this.elf_connectors.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // female elf element
    fetch("systems/wfrp4e/names/male_elf_element.txt").then(r => r.text()).then(async nameText => {
      this.elf_male_element = []
      nameText.split("\n").forEach((nameGroup) => this.elf_male_element.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // male elf element
    fetch("systems/wfrp4e/names/female_elf_element.txt").then(r => r.text()).then(async nameText => {
      this.elf_female_element = []
      nameText.split("\n").forEach((nameGroup) => this.elf_female_element.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })
    // wood elf end
    fetch("systems/wfrp4e/names/elf_wood_end.txt").then(r => r.text()).then(async nameText => {
      this.elf_wood_end = []
      nameText.split("\n").forEach((nameGroup) => this.elf_wood_end.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })
    // high elf end
    fetch("systems/wfrp4e/names/elf_high_end.txt").then(r => r.text()).then(async nameText => {
      this.elf_high_end = []
      nameText.split("\n").forEach((nameGroup) => this.elf_high_end.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // @@@@@@@@@@ Halfling @@@@@@@@@@@@@
    // Halfling start
    fetch("systems/wfrp4e/names/halfling_start.txt").then(r => r.text()).then(async nameText => {
      this.halfling_start = []
      nameText.split("\n").forEach((nameGroup) => this.halfling_start.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })

    // Male ending
    fetch("systems/wfrp4e/names/male_halfling_element.txt").then(r => r.text()).then(async nameText => {
      this.male_halfling_element = []
      nameText.split("\n").forEach((nameGroup) => this.male_halfling_element.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })
    // Female ending
    fetch("systems/wfrp4e/names/female_halfling_element.txt").then(r => r.text()).then(async nameText => {
      this.female_halfling_element = []
      nameText.split("\n").forEach((nameGroup) => this.female_halfling_element.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })
    // Halfling surnames
    fetch("systems/wfrp4e/names/halfling_surnames.txt").then(r => r.text()).then(async nameText => {
      this.halfling_surnames = []
      nameText.split("\n").forEach((nameGroup) => this.halfling_surnames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })
    // Halfling nicknames
    fetch("systems/wfrp4e/names/halfling_nicknames.txt").then(r => r.text()).then(async nameText => {
      this.halfling_nicknames = []
      nameText.split("\n").forEach((nameGroup) => this.halfling_nicknames.push(nameGroup.split(",").map(function (item) {
        return item.trim()
      })))
    })
  }

  static human = {
    forename(gender = "male") {
      let names = game.wfrp4e.names[`human_${gender}_Forenames`];
      let size = names.length
      let roll = Math.floor(CONFIG.Dice.randomUniform()*size)
      let nameGroup = names[roll]

      let base = nameGroup[0]
      let option;
      roll = Math.floor(CONFIG.Dice.randomUniform()*nameGroup.length)
      if (roll != 0)
        option = nameGroup[roll].substr(1)

      return game.wfrp4e.names.evaluateNamePartial(base) + (game.wfrp4e.names.evaluateNamePartial(option || ""));
    },
    surname() {
      if (Math.ceil(CONFIG.Dice.randomUniform() * 2) == 1) // Don't use prefix - suffix
      {
        let size = game.wfrp4e.names.surnames.length;
        let roll = Math.floor(CONFIG.Dice.randomUniform()*size)
        let nameGroup = game.wfrp4e.names.surnames[roll]

        let base = nameGroup[0]
        let option;
        roll = Math.floor(CONFIG.Dice.randomUniform()*nameGroup.length)
        if (roll != 0)
          option = nameGroup[roll].substr(1)

        return game.wfrp4e.names.evaluateNamePartial(base) + (game.wfrp4e.names.evaluateNamePartial(option || ""));
      }
      else // Use prefix and suffix surname
      {
        let prefixSize = game.wfrp4e.names.surnamePrefixes.length;
        let suffixSize = game.wfrp4e.names.surnameSuffixes.length;

        let prefixChoice = game.wfrp4e.names.surnamePrefixes[Math.floor(CONFIG.Dice.randomUniform()*prefixSize)][0]
        let suffixChoice = game.wfrp4e.names.surnameSuffixes[Math.floor(CONFIG.Dice.randomUniform()*suffixSize)][0]

        return game.wfrp4e.names.evaluateNamePartial(prefixChoice) + game.wfrp4e.names.evaluateNamePartial(suffixChoice)
      }
    }
  }
  static dwarf = {
    forename(gender = "male") {
      let names = game.wfrp4e.names[`dwarf_${gender}_Forenames`];
      let size = names.length
      let roll = Math.floor(CONFIG.Dice.randomUniform()*size)
      let nameGroup = names[roll]

      let base = nameGroup[0]
      let option;
      roll = Math.floor(CONFIG.Dice.randomUniform()*(nameGroup.length))
      if (roll != 0)
        option = nameGroup[roll].substr(1)

      return game.wfrp4e.names.evaluateNamePartial(base) + (game.wfrp4e.names.evaluateNamePartial(option || ""));
    },
    surname(gender = "male") {
      let base = this.forename(gender)
      let suffix = "";
      if (gender == "male") {
        suffix = (Math.ceil(CONFIG.Dice.randomUniform() * 2) == 1 ? "snev" : "sson")
      }
      else {
        suffix = (Math.ceil(CONFIG.Dice.randomUniform() * 2) == 1 ? "sniz" : "sdottir")
      }
      return base + suffix;
    }
  }
  static helf = {
    forename(gender="male", type = "helf") {
      let source = (Math.ceil(CONFIG.Dice.randomUniform() * 2) == 1 ? "forename" : "generate")
      if (source == "forename") {
        let names = game.wfrp4e.names[`elf_Forenames`];
        let size = names.length
        let roll = Math.floor(CONFIG.Dice.randomUniform()*size)
        return names[roll][0];
      }
      else {
        /**
         * 110
         * 010
         * 101
         * 001
         */
        let useConnector = false, useElement = false, useEnd = false;

        switch (Math.floor(CONFIG.Dice.randomUniform() * 4 + 1) == 1) {
          case 1:
            useConnector = true;
            useElement = true;
            break;
          case 2:
            useElement = true;
            break;
          case 3:
            useConnector = true
            useEnd = true;
            break;
          case 4:
            useEnd = true;
        }


        let start = game.wfrp4e.names.RollArray("elf_start");

        let connector = useConnector ? game.wfrp4e.names.RollArray("elf_connectors") : ""
        let element = useElement ? game.wfrp4e.names.RollArray(`elf_${gender}_element`) : ""

        let elfType = type.includes("h") ? "high" : "wood"
        let end = useEnd ? game.wfrp4e.names.RollArray(`elf_${elfType}_end`) : "";
        return start + connector + element + end;
      }
    },
    surname(){
      return game.wfrp4e.names.RollArray("elf_surnames")
    }
  }

  static welf = {
    forename(gender="male", type="welf"){
      return game.wfrp4e.names.helf.forename(gender, type)
    },
    surname(){
      return game.wfrp4e.names.RollArray("elf_surnames")
    }
  }

  static halfling = {
    forename(gender="male"){
      let nickname = Math.ceil(CONFIG.Dice.randomUniform() * 2) == 1 ? `(${game.wfrp4e.names.RollArray("halfling_nicknames")})` : ""
      return `${game.wfrp4e.names.RollArray("halfling_start")}${game.wfrp4e.names.RollArray(`${gender}_halfling_element`)} ${nickname}`
    },
    surname(){
      return game.wfrp4e.names.RollArray("halfling_surnames")
    }
  }

  /**
   * Generate a Forename + Surname
   * 
   * @param {Object} options species, gender
   */
  static generateName(options = { species: "human" }) {
    if (!options.species) {
      options.species = "human"
    }
    if (options.species)
      options.species = options.species.toLowerCase()
    if (options.gender)
      options.gender = options.gender.toLowerCase();

    if (options.gender == game.i18n.localize("CHARGEN.Details.Male").toLowerCase())
      options.gender = "male"
    else if (options.gender == game.i18n.localize("CHARGEN.Details.Female").toLowerCase())
      options.gender = "female"

    // If gender not recognize, remove it (roll male or female names randomly)
    if (!["male", "female"].includes(options.gender))
      delete options.gender

    if (!options.gender) // Generate male/female randomly
      options.gender = (Math.ceil(CONFIG.Dice.randomUniform() * 2) == 1 ? "male" : "female")

    return this[options.species].forename(options.gender) + " " + this[options.species].surname(options.gender)
  }

  /**
   * Parses down a name the partials given.
   * 
   * Name partial example: "Bar(f)sheim(er)" - randomly decide what to include within parentheses.
   * 
   * @param {String} namePartial A name partial is the inner choices
   */
  static evaluateNamePartial(namePartial) {
    var options = Array.from(namePartial.matchAll(/\((.+?)\)/g))
    for (let option of options) {
      if (Math.ceil(CONFIG.Dice.randomUniform() * 2) == 1) {
        namePartial = namePartial.replace(option[0], this.evaluateChoices(option[1]))
      }
      else {
        namePartial = namePartial.replace(option[0], "")
      }
    }
    return this.evaluateChoices(namePartial)
  }

  /**
   * A name is typically followed by choices of suffixes to use, separated by a comma.
   * 
   * Example of choices - "Aver, -land(er), -lund(er)" - Aver is not a choice, the other two are choices, however at least one of them is required.
   * 
   * @param {String} choiceString String of name chocies
   */
  static evaluateChoices(choiceString) {
    if (!choiceString)
      return choiceString
    let choices = Array.from(choiceString.matchAll(/(\w+)[\/]*/g))
    let choice = Math.floor(CONFIG.Dice.randomUniform()*choices.length)
    return choices[choice][1]
  }

  static RollArray(arrayName) {
    let elements = this[arrayName];
    let size = elements.length
    let roll = Math.floor(CONFIG.Dice.randomUniform()*size)
    return elements[roll][0]
  }
}