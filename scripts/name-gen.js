/**
 * Specialized class to consume and generate from a large list of human name options extracted from
 * http://www.windsofchaos.com/wp-content/uploads/encroachment/book-of-imperial-names.pdf
 * See the `names` folder in the system directory to examine the list of names and options.
 */

class NameGenWfrp
{
  static _loadNames()
  {
    console.log("wfrp4e | Loading Names...")

    // Surname option 1
    fetch("systems/wfrp4e/names/human_surnames.txt").then(r => r.text()).then(async nameText =>
    {
      this.surnames = []
      nameText.split("\n").forEach((nameGroup) => this.surnames.push(nameGroup.split(",").map(function (item)
      {
        return item.trim()
      })))
    })
    // Surname option 2 - prefix
    fetch("systems/wfrp4e/names/human_surnames_prefix.txt").then(r => r.text()).then(async nameText =>
    {
      this.surnamePrefixes = []
      nameText.split("\n").forEach((nameGroup) => this.surnamePrefixes.push(nameGroup.split(",").map(function (item)
      {
        return item.trim()
      })))
    })

    // Surname option 2 - suffix
    fetch("systems/wfrp4e/names/human_surnames_suffix.txt").then(r => r.text()).then(async nameText =>
    {
      this.surnameSuffixes = []
      nameText.split("\n").forEach((nameGroup) => this.surnameSuffixes.push(nameGroup.split(",").map(function (item)
      {
        return item.trim()
      })))
    })

    // Male forenames
    fetch("systems/wfrp4e/names/male_human_forenames.txt").then(r => r.text()).then(async nameText =>
    {
      this.human_male_Forenames = []
      nameText.split("\n").forEach((nameGroup) => this.human_male_Forenames.push(nameGroup.split(",").map(function (item)
      {
        return item.trim()
      })))
    })

    // Female forenames
    fetch("systems/wfrp4e/names/female_human_forenames.txt").then(r => r.text()).then(async nameText =>
    {
      this.human_female_Forenames = []
      nameText.split("\n").forEach((nameGroup) => this.human_female_Forenames.push(nameGroup.split(",").map(function (item)
      {
        return item.trim()
      })))
    })

    // @@@@@@@@@@ DWARF @@@@@@@@@@@@@
    // male forenames
    fetch("systems/wfrp4e/names/male_dwarf_forenames.txt").then(r => r.text()).then(async nameText =>
      {
        this.dwarf_male_Forenames = []
        nameText.split("\n").forEach((nameGroup) => this.dwarf_male_Forenames.push(nameGroup.split(",").map(function (item)
        {
          return item.trim()
        })))
      })

    // Female forenames
    fetch("systems/wfrp4e/names/female_dwarf_forenames.txt").then(r => r.text()).then(async nameText =>
      {
        this.dwarf_female_Forenames = []
        nameText.split("\n").forEach((nameGroup) => this.dwarf_female_Forenames.push(nameGroup.split(",").map(function (item)
        {
          return item.trim()
        })))
      })

    // @@@@@@@@@@ ELF @@@@@@@@@@@@@
        // elf forenames
        fetch("systems/wfrp4e/names/elf_forenames.txt").then(r => r.text()).then(async nameText =>
          {
            this.elf_Forenames = []
            nameText.split("\n").forEach((nameGroup) => this.elf_Forenames.push(nameGroup.split(",").map(function (item)
            {
              return item.trim()
            })))
          })

          fetch("systems/wfrp4e/names/elf_surnames.txt").then(r => r.text()).then(async nameText =>
            {
              this.elf_surnames = []
              nameText.split("\n").forEach((nameGroup) => this.elf_surnames.push(nameGroup.split(",").map(function (item)
              {
                return item.trim()
              })))
            })
        // elf start
        fetch("systems/wfrp4e/names/elf_start.txt").then(r => r.text()).then(async nameText =>
          {
            this.elf_start = []
            nameText.split("\n").forEach((nameGroup) => this.elf_start.push(nameGroup.split(",").map(function (item)
            {
              return item.trim()
            })))
          })
      
      // elf connector
      fetch("systems/wfrp4e/names/elf_connectors.txt").then(r => r.text()).then(async nameText =>
        {
          this.elf_connectors = []
          nameText.split("\n").forEach((nameGroup) => this.elf_connectors.push(nameGroup.split(",").map(function (item)
          {
            return item.trim()
          })))
        })

              // female elf element
      fetch("systems/wfrp4e/names/male_elf_element.txt").then(r => r.text()).then(async nameText =>
        {
          this.elf_male_element = []
          nameText.split("\n").forEach((nameGroup) => this.elf_male_element.push(nameGroup.split(",").map(function (item)
          {
            return item.trim()
          })))
        })

              // male elf element
      fetch("systems/wfrp4e/names/female_elf_element.txt").then(r => r.text()).then(async nameText =>
        {
          this.elf_female_element = []
          nameText.split("\n").forEach((nameGroup) => this.elf_female_element.push(nameGroup.split(",").map(function (item)
          {
            return item.trim()
          })))
        })
        // wood elf end
      fetch("systems/wfrp4e/names/elf_wood_end.txt").then(r => r.text()).then(async nameText =>
        {
          this.elf_wood_end = []
          nameText.split("\n").forEach((nameGroup) => this.elf_wood_end.push(nameGroup.split(",").map(function (item)
          {
            return item.trim()
          })))
        })
        // high elf end
      fetch("systems/wfrp4e/names/elf_high_end.txt").then(r => r.text()).then(async nameText =>
        {
          this.elf_high_end = []
          nameText.split("\n").forEach((nameGroup) => this.elf_high_end.push(nameGroup.split(",").map(function (item)
          {
            return item.trim()
          })))
        })

    // @@@@@@@@@@ Halfling @@@@@@@@@@@@@
    // Halfling start
    fetch("systems/wfrp4e/names/halfling_start.txt").then(r => r.text()).then(async nameText =>
      {
        this.halfling_start = []
        nameText.split("\n").forEach((nameGroup) => this.halfling_start.push(nameGroup.split(",").map(function (item)
        {
          return item.trim()
        })))
      })

    // Male ending
    fetch("systems/wfrp4e/names/male_halfling_element.txt").then(r => r.text()).then(async nameText =>
      {
        this.male_halfling_element = []
        nameText.split("\n").forEach((nameGroup) => this.male_halfling_element.push(nameGroup.split(",").map(function (item)
        {
          return item.trim()
        })))
      })
          // Female ending
    fetch("systems/wfrp4e/names/female_halfling_element.txt").then(r => r.text()).then(async nameText =>
      {
        this.female_halfling_element = []
        nameText.split("\n").forEach((nameGroup) => this.female_halfling_element.push(nameGroup.split(",").map(function (item)
        {
          return item.trim()
        })))
      })
      // Halfling surnames
      fetch("systems/wfrp4e/names/halfling_surnames.txt").then(r => r.text()).then(async nameText =>
        {
          this.halfling_surnames = []
          nameText.split("\n").forEach((nameGroup) => this.halfling_surnames.push(nameGroup.split(",").map(function (item)
          {
            return item.trim()
          })))
        })
        // Halfling nicknames
        fetch("systems/wfrp4e/names/halfling_nicknames.txt").then(r => r.text()).then(async nameText =>
          {
            this.halfling_nicknames = []
            nameText.split("\n").forEach((nameGroup) => this.halfling_nicknames.push(nameGroup.split(",").map(function (item)
            {
              return item.trim()
            })))
          })
    }
  /**
   * Generate a Forename + Surname
   * 
   * @param {Object} options species, gender
   */
  static generateName(options = {species: "human"})
  {
    if (!options.species)
    {
      options.species = "human"
    }
    if (options.species)
      options.species = options.species.toLowerCase()
    if (options.gender)
      options.gender = options.gender.toLowerCase();
    else // Generate male/female randomly
      options.gender = (new Roll("1d2").roll().total == 1 ? "male" : "female")

    return this.generateForename(options) + " " + this.generateSurname(options)
  }

  /**
   * Generate a forename
   * 
   * @param {Object} options species, gender
   */
  static generateForename({species,gender})
  {
    species = species || "human"
    gender = gender || "male"

    if (species == "human" || species == "dwarf")
    {
      let names = this[`${species}_${gender}_Forenames`];
      let size = names.length
      let roll = new Roll(`1d${size}-1`).roll().total
      let nameGroup = names[roll]

      let base = nameGroup[0]
      let option;
      roll = new Roll(`1d${nameGroup.length}-1`).roll().total
      if (roll != 0)
        option = nameGroup[roll].substr(1)

      return this.evaluateNamePartial(base) + (this.evaluateNamePartial(option || ""));
    }
    else if (species.includes("elf"))
    {
      let source = (new Roll("1d2").roll().total == 1 ? "forename" : "generate")
      if (source == "forename")
      {
        let names = this[`elf_Forenames`];
        let size = names.length
        let roll = new Roll(`1d${size}-1`).roll().total
        return names[roll][0];
      }
      else 
      {
        /**
         * 110
         * 010
         * 101
         * 001
         */
        let useConnector = false, useElement = false, useEnd = false;

        switch(new Roll(`1d4`).roll().total)
        {
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


        let start = this.RollArray("elf_start");
        
        let connector = useConnector ?  this.RollArray("elf_connectors") : ""
        let element = useElement ? this.RollArray(`elf_${gender}_element`) : ""

        let elfType =  species.includes("h") ? "high" : "wood"
        let end = useEnd ?  this.RollArray(`elf_${elfType}_end`) : "";
        return start + connector + element + end;
      }
    }
    else if (species == "halfling")
    {
      let nickname = new Roll("1d2").roll().total == 1 ? `(${this.RollArray("halfling_nicknames")})` : ""
        return `${this.RollArray("halfling_start")}${this.RollArray(`${gender}_halfling_element`)} ${nickname}`
    }
  }


  /**
   * Generate a Surname - use one of two options
   * 
   * Option 1. Choose and evaluate from a list of surnames
   * Option 2. Choose and evaluate from a list of prefixes and suffixes for surnames
   * 
   * @param {Object} options species, gender
   */
  static generateSurname(options = {species: "human", gender : "male"})
  {
    if (options.species == "human")
    {
      if (new Roll("1d2").roll().total == 1) // Don't use prefix - suffix
      {
        let size = this.surnames.length;
        let roll = new Roll(`1d${size}-1`).roll().total
        let nameGroup = this.surnames[roll]

        let base = nameGroup[0]
        let option;
        roll = new Roll(`1d${nameGroup.length}-1`).roll().total
        if (roll != 0)
          option = nameGroup[roll].substr(1)

        return this.evaluateNamePartial(base) + (this.evaluateNamePartial(option || ""));
      }
      else // Use prefix and suffix surname
      {
        let prefixSize = this.surnamePrefixes.length;
        let suffixSize = this.surnameSuffixes.length;
        let prefixChoice = this.surnamePrefixes[new Roll(`1d${prefixSize}-1`).roll().total][0]
        let suffixChoice = this.surnameSuffixes[new Roll(`1d${suffixSize}-1`).roll().total][0]

        return this.evaluateNamePartial(prefixChoice) + this.evaluateNamePartial(suffixChoice)
      }
    } 
    else if (options.species == "dwarf")
    {
      let base = this.generateForename({species: options.species, gender:  options.gender})
      let suffix = "";
      if (options.gender == "male")
      {
        suffix = (new Roll("1d2").roll().total == 1 ? "snev" : "sson")
      }
      else 
      {
        suffix = (new Roll("1d2").roll().total == 1 ? "sniz" : "sdottir")
      }
      return base+suffix;
    }
    else if (options.species.includes("elf"))
    {
      return this.RollArray("elf_surnames")
    }
    else if (options.species == "halfling")
    {
      return this.RollArray("halfling_surnames")
    }
  }

  /**
   * Parses down a name the partials given.
   * 
   * Name partial example: "Bar(f)sheim(er)" - randomly decide what to include within parentheses.
   * 
   * @param {String} namePartial A name partial is the inner choices
   */
  static evaluateNamePartial(namePartial)
  {
    let chooser = new Roll("1d2").roll();
    var options = Array.from(namePartial.matchAll(/\((.+?)\)/g))
    for (let option of options)
    {
      if (chooser.reroll().total == 1)
      {
        namePartial = namePartial.replace(option[0], this.evaluateChoices(option[1]))
      }
      else
      {
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
  static evaluateChoices(choiceString)
  {
    if (!choiceString)
      return choiceString
    let choices = Array.from(choiceString.matchAll(/(\w+)[\/]*/g))
    let choice = new Roll(`1d${choices.length}-1`).roll().total;
    return choices[choice][1]
  }

  static RollArray(arrayName)
  {
    let elements = this[arrayName];
    let size = elements.length
    let roll = new Roll(`1d${size}-1`).roll().total
    return elements[roll][0]
  }
}