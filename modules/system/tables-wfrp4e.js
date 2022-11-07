
import WFRP_Utility from "../system/utility-wfrp4e.js";

/**
 * This class handles all aspects of custom WFRP tables.
 * 
 * The WFRP_Tables is given table objects on 'init' and 'ready' hooks by
 * both the system, modules, and the world. See the tables folder for 
 * how they're structured. All files in that folder will be
 * added to WFRP_Tables if possible. 
 */


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
  static async rollTable(tableKey, options = {}, column = null) {
    let modifier = options.modifier || 0;
    let minOne = options.minOne || false;

    let table = this.findTable(tableKey.toLowerCase(), column);


    if (table) {

      if (table.columns)
        throw new Error(game.i18n.localize("ERROR.Column"))

      let formula = table.formula;
      let tableSize = Array.from(table.results).length;

      // If no die specified, just use the table size and roll
      let roll = await new Roll(`${formula} + @modifier`, { modifier }).roll( { async: true });

      if (game.dice3d && !options.hideDSN)
        await game.dice3d.showForRoll(roll)

      let rollValue = options.lookup || roll.total; // options.lookup will ignore the rolled value for the input value
      let displayTotal = options.lookup || roll.result; // Roll value displayed to the user
      if (modifier == 0)
        displayTotal = (0, eval)(displayTotal) // Clean up display value if modifier 0 (59 instead of 59 + 0)
      if (rollValue <= 0 && minOne) // Min one provides a lower bound of 1 on the result
        rollValue = 1;

      else if (rollValue <= 0)
        return {
          roll: rollValue
        };

      let resultList = Array.from(table.results)

      tableSize = resultList.sort((a, b) => a.range[1] - b.range[1])[resultList.length - 1].range[1]

      if (rollValue > tableSize)
        rollValue = tableSize

      let rollResult = table.getResultsForRoll(rollValue)[0]
      let flags = rollResult.flags.wfrp4e || {}
      let result = {
        result : rollResult.getChatText(),
        roll : displayTotal,
        object : rollResult.toObject(),
        title : table.name,
      }



      // If table result text is a UUID link, add a text property with just the label
      result.text = WFRP_Utility.extractLinkLabel(result.result)

      mergeObject(result, flags)

      if (Object.keys(game.wfrp4e.config.hitLocationTables).includes(tableKey))
        result = this.formatHitloc(rollResult, rollValue)

      return result

    }
    else if (tableKey == "hitloc" || tableKey == "scatter") {

      // Scatter is a special table - calculate distance and return
      if (tableKey == "scatter") {
        let roll = (await new Roll(`1d10`).roll({ async: true })).total;
        let dist = (await new Roll('2d10').roll({ async: true })).total;

        return { result: this.scatterResult({roll, dist}), roll }

      }
      else if (tableKey == "hitloc") {
        let roll = await new Roll(`1d100`).roll();
        let result = this._lookup("hitloc", options.lookup || roll.total)
        result.roll = roll.total
        return result
      }
    }
    else {
      if (tableKey != "menu")
        return ui.notifications.error(game.i18n.localize("ERROR.Table"))
      else 
        return this.tableMenu()
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
        if (WFRP_Tables._inRange(value, row.range[column]))
          return duplicate(row)
      }
    }

    else if (column && this[table].multi) {
      for (let row of this[table].rows) {
        if (WFRP_Tables._inRange(value, row.range[column]))
          return duplicate(row[column])
      }
    }

    else {
      for (let row of this[table].rows) {
        if (WFRP_Tables._inRange(value, row.range))
          return duplicate(row)
      }
    }
  }

  static _inRange(value, range) {
    if (range.length == 0)
      return false
    if (range.length == 1)
      range.push(range[0])
    if (value >= range[0] && value <= range[1])
      return true
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

  
  static formatHitloc(result, roll) {
    let flags = result.flags.wfrp4e || {}
    return {
      description : result.getChatText(),
      result : flags.loc,
      roll
    }
  }

  static async rollToChat(table, options = {}, column = null, rollMode) {
    let chatOptions = game.wfrp4e.utility.chatDataSetup("", rollMode, true)
    chatOptions.content = await this.formatChatRoll(table, options, column);
    chatOptions.type = 0;
    if (chatOptions.content)
      ChatMessage.create(chatOptions);
    ui.sidebar.activateTab("chat")
  }

  static findTable(key, column) {
    WFRP_Utility.log(`Finding Table key: ${key} column: ${column}`)
    let tables = game.tables.filter(i => i.getFlag("wfrp4e", "key") == key)
    let table 

    // Look at table settings first
    let tableSettings = game.settings.get("wfrp4e", "tableSettings");
    WFRP_Utility.log(`Table Settings: `, undefined, tableSettings)

    let id = tableSettings[`${key}${column ? "-"+column : ""}`];
    if (id)
      table = game.tables.get(id)

    if (table)
    {
      WFRP_Utility.log("Found Table with settings: ", undefined, table)
      return table
    }

    WFRP_Utility.log("Table not found with settings, finding first table that matches")

    // If more than one table with that key, and column is specified, return that column
    if (tables.length > 1 && column)
      return tables.find(i => i.getFlag("wfrp4e", "column") == column)

    // If only one result with that key, or multiple results that don't have a column, return the first one (this condition is needed to return Minor Miscast table if Minor Miscast (Moo) also exists at the same time)
    else if (tables.length == 1 || tables.map(t => t.getFlag("wfrp4e", "column")).filter(t => t).length < 1) 
    {
      return tables[0]
    }

    // If multiple results, return a special object that has a generalized name and columns array listing the tables 
    else  if (tables.length)
      return {name : tables[0].name.split("-")[0].trim(), columns: tables}
  }

  /**
   * Takes the key of an existing hit location Rollable Table and returns a simple hitloc object.
   * 
   * {
   *  lArm : "Left Arm",
   *  rArm : "Right Arm",
   *  ....
   * }
   * 
   * @param {String} key key of the hit location table
   */
  static getHitLocTable(key)
  {
    let hitloc = {};
    let table = this.findTable(key)

    if (table)
    {
      table.results.forEach(result => {
        if (result.flags.wfrp4e.loc)
          hitloc[result.flags.wfrp4e.loc] = result.text
      })
    }
    return hitloc
  }


    /**
   * Takes a hitloc key and turns it into a result object
   * 
   * 
   * @param {String} key key of the hit location table
   */
     static hitLocKeyToResult(resultKey, tableKey = "hitloc")
     {
       let table = this.findTable(tableKey)
   
       if (table)
       {
         for(let result of table.results)
         {
           if (result.flags.wfrp4e?.loc == resultKey)
             return this.formatHitloc(result, result.range[0])
         }
       }
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
  static async formatChatRoll(table, options = {}, column = null) {
    table = this.generalizeTable(table);

    let tableObject = this.findTable(table, column);

    if (tableObject && tableObject.columns)
      return this.promptColumn(table);


    let result = await this.rollTable(table, options, column);
    if (options.lookup && !game.user.isGM) // If the player (not GM) rolled with a lookup value, display it so they can't be cheeky cheaters
      result.roll = game.i18n.localize("TABLE.Lookup") + result.roll;
    try {
      // Cancel the roll if below 1 and not minimum one
      if (result.roll <= 0 && !options.minOne)
        return game.i18n.format("TABLE.Cancel", { result: result.roll })
    }
    catch
    { }

    // If the roll is an item, don't post the link to chat, post the item to chat
    if (result.object?.documentCollection && result.object?.documentId)
    {
      let collection = game.packs.get(result.object.documentCollection)

      if (collection)
        await collection.getDocuments()

      if (!collection)
        collection = game.collections.get(result.object.documentCollection)

      if (collection)
      {
        let item = collection.get(result.object.documentId)
        if (item && item.documentName == "Item")
        {
          item.postItem("inf");
          return null
        }
      }

    }

    return result.result

  }

  /**
   * Show the table help menu, display all tables as clickables and hidden tables if requested.
   * 
   * @param {Boolean} showHidden Show hidden tables
   */
  static tableMenu() {
    let tableMenu = `<b><code>/table</code> ${game.i18n.localize("Commands")}</b><br>`

    let tables = game.tables.filter(i => i.permission)

    let columnsAdded = [];

    // For each table, add a clickable link
    for (let table of tables)
    {
      let key = table.getFlag("wfrp4e", "key")
      let tableObject = this.findTable(key)

      // If the table is a column, add only the general table, and remember the table to not list again for future columns (Only list Weather, not Weather - Spring, Weather - Winter, etc)
      if (tableObject.columns && !columnsAdded.includes(key))
      {
        columnsAdded.push(key)
        tableMenu += `<a data-table='${key}' class='table-click'><i class="fas fa-list"></i> <code>${key}</code></a> - ${tableObject.name}<br>`
      }
      // If no columns, just list tables
      else if (tableObject && !tableObject.columns)
        tableMenu += `<a data-table='${key}' class='table-click'><i class="fas fa-list"></i> <code>${key}</code></a> - ${table.name}<br>`
    }
    return {result : tableMenu};
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
  static promptColumn(table) {
    let prompt = `<h3>${game.i18n.localize("CHAT.ColumnPrompt")}</h3>`

    let tableObject = this.findTable(table);
    for (let c of tableObject.columns)
      prompt += `<div><a class = "table-click" data-table="${table}" data-column = "${c.getFlag("wfrp4e", "column")}"><i class="fas fa-list"></i> ${c.name}</a></div>`

    return prompt;
  }


  static scatterResult({roll, dist}) {
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
      "<td position='10'> " + game.i18n.localize("CHAT.ScatterTarget") +
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

    if (roll == 9)
      tableHtml += game.i18n.localize("CHAT.ScatterYou");
    else if (roll == 10)
      tableHtml += game.i18n.localize("CHAT.ScatterThem");
    else
      tableHtml += game.i18n.localize("CHAT.ScatterNote")
    tableHtml = tableHtml.replace(`position='${roll}'`, "class='selected-position'")
    if (dist && roll <= 8) // Don't roll for 9 or 10
      tableHtml = tableHtml.replace("'selected-position'>", `'selected-position'> ${dist} ${game.i18n.localize("yards")}`)
    return tableHtml
  }


  static get hitloc() {
    return {
      "name": game.i18n.localize("WFRP4E.LocationsTable"),
      "die": "1d100",
      "rows": [{
        "description": game.i18n.localize("WFRP4E.Locations.head"),
        "result": "head",
        "range": [1, 9]
      }, {
        "description": game.i18n.localize("WFRP4E.Locations.lArm"),
        "result": "lArm",
        "range": [10, 24]
      }, {
        "description": game.i18n.localize("WFRP4E.Locations.rArm"),
        "result": "rArm",
        "range": [25, 44]
      }, {
        "description": game.i18n.localize("WFRP4E.Locations.body"),
        "result": "body",
        "range": [45, 79]
      }, {
        "description": game.i18n.localize("WFRP4E.Locations.lLeg"),
        "result": "lLeg",
        "range": [80, 89]
      }, {
        "description": game.i18n.localize("WFRP4E.Locations.rLeg"),
        "result": "rLeg",
        "range": [90, 100]
      }]
    }
  }


  static get scatter() {
    return {
      name: game.i18n.localize("WFRP4E.ScatterTable"),
      die: "1d10",
      rows: [
        {
          name: game.i18n.localize("WFRP4E.Scatter.TopLeft"),
          range: [1, 1]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.TopMiddle"),
          range: [2, 2]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.TopRight"),
          range: [3, 3]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.CenterLeft"),
          range: [4, 4]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.CenterRight"),
          range: [5, 5]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.BottomLeft"),
          range: [6, 6]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.BottomMiddle"),
          range: [7, 7]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.BottomRight"),
          range: [8, 8]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.AtYourFeet"),
          range: [9, 9]
        },
        {
          name: game.i18n.localize("WFRP4E.Scatter.AtTargetFeet"),
          range: [10, 10]
        },
      ]
    }
  }


}
