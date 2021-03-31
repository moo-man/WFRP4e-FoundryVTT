

/**
 * This class handles all aspects of custom WFRP tables.
 * 
 * The WFRP_Tables is given table objects on 'init' and 'ready' hooks by
 * both the system, modules, and the world. See the tables folder for 
 * how they're structured. All files in that folder will be
 * added to WFRP_Tables if possible. 
 */

import WFRP_Audio from "./audio-wfrp4e.js";

export default class WFRP_Tables {

  /**
   * The base function to retrieve a result from a table given various parameters.
   * 
   * Options: 
   * `modifier` - modify the roll result by a certain amount
   * `minOne` - If true, the minimum roll on the table is 1 (used when a negative modifier is applied)
   * `lookup` - forego rolling and use this value to lookup the result on the table.
   * 
   * @param {String} table Table name - the filename of the table file
   * @param {Object} options Various options for rolling the table, like modifier
   * @param {String} column Which column to roll on, if possible.
   */
  static rollTable(table, options = {}, column = null) {
    let modifier = options.modifier || 0;
    let minOne = options.minOne;
    let maxSize = options.maxSize || false;

    table = table.toLowerCase();
    if (this[table]) {
      let die = this[table].die;
      let tableSize;
      // Take the last result of the table, and find it's max range, that is the highest value on the table.
      if (!this[table].columns)
        tableSize = this[table].rows[this[table].rows.length - 1].range[1];
      else {
        tableSize = this[table].rows[this[table].rows.length - 1].range[this[table].columns[0]][1]; // This isn't confusing at all - take the first column, find its last (max) value, that is the table size
      }
      // If no die specified, just use the table size and roll
      if (!die)
        die = `1d${tableSize}`;
      let roll = new Roll(`${die} + @modifier`, { modifier }).roll();

      let rollValue = options.lookup || roll.total; // options.lookup will ignore the rolled value for the input value
      let displayTotal = options.lookup || roll.result; // Roll value displayed to the user
      if (modifier == 0)
        displayTotal = eval(displayTotal) // Clean up display value if modifier 0 (59 instead of 59 + 0)
      if (rollValue <= 0 && minOne) // Min one provides a lower bound of 1 on the result
        rollValue = 1;

      else if (rollValue <= 0)
        return {
          roll: rollValue
        };

      if (rollValue > tableSize)
        rollValue = tableSize;

      // Scatter is a special table - calculate distance and return
      if (table == "scatter") {
        if (roll.total <= 8) // Rolls of 9 and 10 do not need distance calculated
        {
          let distRoll = new Roll('2d10').roll().total;
          return { roll: roll.total, dist: distRoll }
        }
        else
          return { roll: roll.total }
      }
      // Lookup the value on the table, merge it with the roll, and return
      return mergeObject(this._lookup(table, rollValue, column), ({ roll: displayTotal }));
    }
    else {
      if (table != "menu")
        return ui.notifications.error("Table not found")
    }
  }

  /**
   * Retrieves a value from a table, using the column if specified
   * 
   * @param {String} table table name
   * @param {Number} value value to lookup
   * @param {String} column column to look under, if needed
   */
  static _lookup(table, value, column = null) {
    if (column && this[table].columns) {
      for (let row of this[table].rows) {
        if (value >= row.range[column][0] && value <= row.range[column][1])
          return duplicate(row)
      }
    }

    else if (column && this[table].multi) {
      for (let row of this[table].rows) {
        if (value >= row.range[column][0] && value <= row.range[column][1])
          return duplicate(row[column])
      }
    }

    else {
      for (let row of this[table].rows) {
        if (value >= row.range[0] && value <= row.range[1])
          return duplicate(row)
      }
    }
  }


  /* -------------------------------------------- */

  // critlleg doesn't exist, yet will be asked for because hit location and 'crit' are concatenated
  // Therefore, change specific locations to generalized ones (rarm -> arm)
  static generalizeTable(table) {
    table = table.toLowerCase();
    table = table.replace("lleg", "leg");
    table = table.replace("rleg", "leg");
    table = table.replace("rarm", "arm");
    table = table.replace("larm", "arm");
    return table;
  }

  static rollToChat(table, options = {}, column = null, rollMode)
  {
    let chatOptions = game.wfrp4e.utility.chatDataSetup("", rollMode, true)
    chatOptions.content = this.formatChatRoll(table, options, column);
    chatOptions.type = 0;
    ChatMessage.create(chatOptions);
    ui.sidebar.activateTab("chat")
  }


  /* -------------------------------------------- */

  /**
   * 
   * Wrapper for rollTable to format rolls from chat commands nicely.
   * 
   * Calls rollTable() and displays the result in a specific format depending
   * on the table rolled on.
   * 
   * @param {String} table Table name - the filename of the table file
   * @param {Object} options Various options for rolling the table, like modifier
   * @param {String} column Which column to roll on, if possible.
   */
  static formatChatRoll(table, options = {}, column = null) {
    table = this.generalizeTable(table);

    // If table has columns but none given, prompt for one.
    if (this[table] && (this[table].columns || this[table].multi) && column == null) {
      return this.promptColumn(table, options);
    }

    let result = this.rollTable(table, options, column);
    if (options.lookup && !game.user.isGM) // If the player (not GM) rolled with a lookup value, display it so they can't be cheeky cheaters
      result.roll = "Lookup: " + result.roll;
    try {
      // Cancel the roll if below 1 and not minimum one
      if (result.roll <= 0 && !options.minOne)
        return `Roll: ${result.roll} - canceled`
    }
    catch
    { }

    // Provide specialized display for different tables
    // I should probably standardize this better.
    switch (table) {
      case "hitloc":
        return `<b>${this[table].name}</b><br>` + game.i18n.localize(result.description);
      case "crithead":
      case "critbody":
      case "critarm":
      case "critleg":
      case "crit":
        WFRP_Audio.PlayContextAudio({ item: { type: "hit" }, action: "hit", outcome: "crit" })
        return `<b>${this[table].name}</b><br><a class = "item-lookup" data-type = "critical"><b>${result.name}</b></a><br>(${result.roll})`

      case "minormis":
      case "majormis":
      case "event":
      case "wrath":
      case "travel":
        return `<b>${this[table].name}</b><br><b>${result.name}</b><br>${result.description} (${result.roll})`;
      case "mutatephys":
      case "mutatemental":
        return `<b>${this[table].name}</b><br><a class = "item-lookup" data-type = "mutation"><b>${result.name}</b></a><br>(${result.roll})`;

      case "doom":
        return `<b>${this[table].name}</b><br>${result.description} (${result.roll})`;
      case "species":
        return `<b>${this[table].name}</b><br>${result.name} (${result.roll})`;

      // case "oops":
      //   return `<b>Oops!</b><br>${result.description} (${result.roll})`;

      case "winds":
        return `<b>${this[table].name}</b><br> <b>Roll:</b> ${eval(result.roll)} <br> <b> ${game.i18n.localize("Modifier")} : </b> ${result.modifier}`;
      case "career":
        return `<b>${this[table].name} - ${ game.wfrp4e.config.species[column]}</b><br> <a class = "item-lookup" data-type="career">${result.name}</a> <br> <b>${game.i18n.localize("Roll")}:</b> ${result.roll}`;
      case "eyes":
      case "hair":
        return `<b>${this[table].name} - ${ game.wfrp4e.config.species[column]}</b><br>${result.name}<br><b>${game.i18n.localize("Roll")}:</b> ${eval(result.roll)}`

      case "job":
        return `<b>${this[table].name}</b><br><b>${column}:</b> ${result.description}`

      // Special scatter table display
      case "scatter":
        let tableHtml = '<table class = "scatter-table">' +
          " <tr>" +
          "<td position='1'> " +
          "</td>" +
          "<td position='2'> " +
          "</td>" +
          "<td position='3'> " +
          "</td>" +
          "</tr>" +
          " <tr>" +
          "<td position='4'> " +
          "</td>" +
          "<td position='10'> T" +
          "</td>" +
          "<td position='5'> " +
          "</td>" +
          "</tr>" +
          " <tr>" +
          "<td position='6'> " +
          "</td>" +
          "<td position='7'> " +
          "</td>" +
          "<td position='8'> " +
          "</td>" +
          "</tr>" +
          "</table>"
        if (result.roll == 9)
          tableHtml += game.i18n.localize("CHAT.ScatterYou");
        else if (result.roll == 10)
          tableHtml += game.i18n.localize("CHAT.ScatterThem");
        else
          tableHtml += game.i18n.localize("CHAT.ScatterNote")
        tableHtml = tableHtml.replace(`position='${result.roll}'`, "class='selected-position'")
        if (result.dist)
          tableHtml = tableHtml.replace("'selected-position'>", `'selected-position'> ${result.dist} ${game.i18n.localize("yards")}`)

        return tableHtml;

      case "talents":
        return `<b>${this[table].name}</b><br> <a class="talent-drag"><i class="fas fa-suitcase"></i> ${result.name}</a>`


      // Non-system table display. Display everything associated with that row.
      default:
        try {
          if (result) {
            let html = `<b>${this[table].name}</b><br>`;
            for (let part in result) {
              if (part == "name")
                html += `<b>${result[part]}</b><br>`
              else if (part == "roll")
                html += "<b>Roll</b>: " + result[part]
              else if (part != "range")
                html += result[part] + "<br>"
            }
            return html;

          }
          else
            throw ""
        }
        catch
        {
          return this.tableMenu();
        }
    }
  }

  /**
   * Show the table help menu, display all tables as clickables and hidden tables if requested.
   * 
   * @param {Boolean} showHidden Show hidden tables
   */
  static tableMenu(showHidden = false) {
    let tableMenu = "<b><code>/table</code> Commands</b><br>"
    let tableVisibility = game.settings.get("wfrp4e", "tableVisibility");

    // For each table, display a clickable link.
    for (let tableKey of Object.keys(this)) {
        if ((tableVisibility[tableKey] != undefined && tableVisibility[tableKey]) || (tableVisibility[tableKey] == undefined && !this[tableKey].hide)) // Use table visibility setting if it exists, otherwise, use whatever the table itself specifies
          tableMenu += `<a data-table='${tableKey}' class='table-click'><i class="fas fa-list"></i> <code>${tableKey}</code></a> - ${this[tableKey].name}<br>`
    }
    return tableMenu;
  }

  // When critical casting, there are few options available, one could be a critical wound on a location, so offer a clickable link.
  static criticalCastMenu(crittable) {
    return `${game.i18n.localize("CHAT.ChooseFrom")}:<ul>
      <li><b>${game.i18n.localize("ROLL.CritCast")}</b>: ${game.i18n.localize("CHAT.CritCast")} <a class=table-click data-table=${crittable}><i class="fas fa-list"></i> ${game.i18n.localize("Critical Wound")}</a></li>
      <li><b>${game.i18n.localize("ROLL.TotalPower")}</b>: ${game.i18n.localize("CHAT.TotalPower")}</li>
      <li><b>${game.i18n.localize("ROLL.UnstoppableForce")}</b>: ${game.i18n.localize("CHAT.UnstoppableForce")}</li>
      </ul`;
  }


  // Critical casting without reaching appropriate SL - forced to be Total power in order to get the spell off
  static restrictedCriticalCastMenu() {
    return `${game.i18n.localize("CHAT.MustChoose")}:<ul>
      <li><b>${game.i18n.localize("ROLL.TotalPower")}</b>: ${game.i18n.localize("CHAT.TotalPower")}</li>
      </ul`;
  }

  // Display all columns for a table so the user can click on them and roll them.
  static promptColumn(table, column) {
    let prompt = `<h3>${game.i18n.localize("CHAT.ColumnPrompt")}</h3>`

    let columns = this[table].columns || this[table].multi 
    for (let c of columns)
      prompt += `<div><a class = "table-click" data-table="${table}" data-column = "${c}"><i class="fas fa-list"></i> ${c}</a></div>`

    return prompt;
  }

}
