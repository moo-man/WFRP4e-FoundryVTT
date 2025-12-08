import WFRP_Utility from "../../../system/utility-wfrp4e";
import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class OvercastItemModel extends BaseItemModel {


  static defineSchema() 
  {
      let schema = super.defineSchema();
      // Embedded Data Models?
      schema.overcast = new fields.SchemaField({
          enabled : new fields.BooleanField(),
          label : new fields.StringField(),
          valuePerOvercast : new fields.SchemaField({
               type : new fields.StringField(),
               value : new fields.NumberField({initial : 1}),
               SL : new fields.BooleanField(),
               additional  : new fields.StringField(),
               characteristic  : new fields.StringField(),
               bonus : new fields.BooleanField(),
               cost : new fields.StringField()
          }),
          initial : new fields.SchemaField({
              type : new fields.StringField(),
              value : new fields.NumberField({initial : 1}),
              SL : new fields.BooleanField(),
              additional  : new fields.StringField(),
              characteristic  : new fields.StringField(),
              bonus : new fields.BooleanField(),
          })
      });
      return schema;
  }

  /**
   * Used to identify an Item as one being a child of OvercastItemModel
   *
   * @final
   * @returns {boolean}
   */
  get hasOvercast() {
    return true;
  }

  get isMagical() {
    return true;
  }



    /**
   * Turns a formula into a processed string for display
   * 
   * Processes damage formula based - same as calculateSpellAttributes, but with additional
   * consideration to whether its a magic missile or not
   * 
   * @param   {String}  formula         Formula to process - "Willpower Bonus + 4" 
   * @param   {boolean} isMagicMissile  Whether or not it's a magic missile - used in calculating additional damage
   * @returns {String}  Processed formula
   */
      computeSpellDamage(formula, isMagicMissile) {
      try {
      if (formula) {
          formula = formula.toLowerCase();

          if (isMagicMissile) {// If it's a magic missile, damage includes willpower bonus
          formula += "+" + this.parent.actor.characteristics["wp"].bonus
          }

          let labels = game.wfrp4e.config.characteristics;
          let sortedCharacteristics = Object.entries(this.parent.actor.characteristics).sort((a,b) => -1 * labels[a[0]].localeCompare(labels[b[0]]));
          sortedCharacteristics.forEach(arr => {
          let ch = arr[0];
          // Handle characteristic with bonus first
          formula = formula.replace(game.wfrp4e.config.characteristicsBonus[ch].toLowerCase(), this.parent.actor.characteristics[ch].bonus);
          formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase(), this.parent.actor.characteristics[ch].value);
          });

          return (0, eval)(formula);
      }
      return 0;
      }
      catch (e) {
        console.error(`Spell from ${this.parent?.actor?.name} threw error: ${e}.\n Arguments:`, this, formula);
        if (ui.notifications) {
          throw ui.notifications.error(game.i18n.format("ERROR.ParseSpell"))
        }
      }
  }



  // Don't really like this here as it uses assumed subclass data, but it'll do for now
  computeOvercastingData() {
    let usage = {
      damage: undefined,
      range: undefined,
      duration: undefined,
      target: undefined,
      other: undefined,
    }

    let damage = this.Damage
    let target = this.Target?.toString()
    let duration = this.Duration
    let range = this.Range

    if (this.magicMissile?.value) {
      usage.damage = {
        label: game.i18n.localize("Damage"),
        count: 0,
        initial: parseInt(damage) || damage,
        current: parseInt(damage) || damage,
        available: false
      }
    }
    if (parseInt(target) && !includesMaximum(target)) {
      usage.target = {
        label: game.i18n.localize("Target"),
        count: 0,
        AoE: false,
        initial: parseInt(target) || target,
        current: parseInt(target) || target,
        unit: "",
        available: false
      }
    }
    else if (target?.includes("AoE") && !includesMaximum(target)) {
      let aoeValue = target.substring(target.indexOf("(") + 1, target.length - 1)
      usage.target = {
        label: game.i18n.localize("AoE"),
        count: 0,
        AoE: true,
        initial: parseInt(aoeValue) || aoeValue,
        current: parseInt(aoeValue) || aoeValue,
        unit: aoeValue.split(" ")[1],
        available: false
      }
    }
    if (parseInt(duration) && !includesMaximum(duration)) {
      usage.duration = {
        label: game.i18n.localize("Duration"),
        count: 0,
        initial: parseInt(duration) || duration,
        current: parseInt(duration) || duration,
        unit: duration.split(" ")[1],
        available: false
      }
    }
    if (parseInt(range) && !includesMaximum(range)) {
      usage.range = {
        label: game.i18n.localize("Range"),
        count: 0,
        initial: parseInt(range) || aoeValue,
        current: parseInt(range) || aoeValue,
        unit: range.split(" ")[1],
        available: false
      }
    }

    if (this.overcast?.enabled) {
      let other = {
        label: this.overcast.label,
        count: 0
      }


      // Set initial overcast option to type assigned, value is arbitrary, characcteristics is based on actor data, SL is a placeholder for tests
      if (this.overcast.initial.type == "value") {
        other.initial = parseInt(this.overcast.initial.value) || 0
        other.current = parseInt(this.overcast.initial.value) || 0
      }
      else if (this.overcast.initial.type == "characteristic") {
        let char = this.parent.actor.characteristics[this.overcast.initial.characteristic]

        if (this.overcast.initial.bonus)
          other.initial = char.bonus
        else
          other.initial = char.value

        other.current = other.initial;
      }
      else if (this.overcast.initial.type == "SL") {
        other.initial = "SL"
        other.current = "SL"
      }

      // See if overcast increments are also based on characteristics, store that value so we don't have to look it up in the roll class
      if (this.overcast.valuePerOvercast.type == "characteristic") {
        let char = this.parent.actor.characteristics[this.overcast.valuePerOvercast.characteristic]

        if (this.overcast.valuePerOvercast.bonus)
          other.increment = char.bonus
        else
          other.increment = char.value

        //other.increment = other.initial;
      }

      usage.other = other;
    }

    this.overcast.usage = usage

    // Perhaps not the best implementation, but if a spell range (or other) says "maximum", don't allow overcasting
    function includesMaximum(string) {
      return string.toLowerCase().includes(game.i18n.localize("ITEM.Maximum").toLowerCase());
    }

  }



  /**
   * Turns a formula into a processed string for display
   * 
   * Turns a spell attribute such as "Willpower Bonus Rounds" into a more user friendly, processed value
   * such as "4 Rounds". If the aoe is checked, it wraps the result in AoE (Result).
   * 
   * @param   {String}  formula   Formula to process - "Willpower Bonus Rounds" 
   * @param   {boolean} aoe       Whether or not it's calculating AoE (changes string return)
   * @returns {String}  formula   processed formula
   */
  computeSpellPrayerFormula(type, aoe = false, formulaOverride) {
    let formula = formulaOverride || this[type]?.value
    try {
      if (Number.isNumeric(formula))
        return formula

      formula = formula.toLowerCase();

      // Do not process these special values
      if (formula != game.i18n.localize("You").toLowerCase() && formula != game.i18n.localize("Special").toLowerCase() && formula != game.i18n.localize("Instant").toLowerCase()) {
        // Iterate through characteristics
        let labels = game.wfrp4e.config.characteristics;
        let sortedCharacteristics = Object.entries(this.parent.actor.characteristics).sort((a,b) => -1 * labels[a[0]].localeCompare(labels[b[0]]));
        sortedCharacteristics.forEach(arr => {
          let ch = arr[0];
          // Handle characteristic with bonus first
          formula = formula.replace(game.wfrp4e.config.characteristicsBonus[ch].toLowerCase(), this.parent.actor.characteristics[ch].bonus);
          formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase(), this.parent.actor.characteristics[ch].value);
        });

        let total = 0;
        let i = 0;
        let s = formula;
        for (; i < s.length; i++) {
          if (!(!isNaN(parseInt(s[i])) || s[i] == ' ' || s[i] == '+' || s[i] == '-' || s[i] == '*' || s[i] == '/')) {
            break;
          }
        }
        if (i > 0) {
          if (i != s.length) {
            total = (0, eval)(s.substr(0, i - 1)) || "";
            formula = total.toString() + " " + s.substr(i).trim();
          } else {
            total = (0, eval)(s) || "";
            formula = total.toString();
          }
        }

        // If AoE - wrap with AoE ( )
        if (aoe)
          formula = "AoE (" + formula.capitalize() + ")";
      }
      return formula.capitalize();
    }
    catch (e) {
      console.error(`computeSpellPrayerFormula from ${this.parent?.actor?.name} threw error: ${e}.\n Arguments:`, this, formula);
      return 0;
    }
  }
}