export default class WFRP4eTableSheet extends Application {
  constructor(table, app) {
    super(app)

    if (typeof table == "string")
    {
      this.table = duplicate(game.wfrp4e.tables[table])
      this.table.key = table;
    }
    else
      this.table = table
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "wfrp4e-table";
    options.template = "systems/wfrp4e/templates/apps/table-sheet.html"
    options.classes.push("wfrp4e", "table-sheet");
    options.resizable = true;
    options.height = 900;
    options.width = 600;
    options.minimizable = true;
    options.title = "WFRP4e Table";
    options.tabs = [{ navSelector: ".tabs", contentSelector: ".content" }]
    return options;
  }

  async _render(force = false, options = {}) {
    options.title = this.table.name
    await super._render(force, options);
  }


  // Pass filter data to template
  getData() {
    let data = super.getData();
    console.log(this.table)
    data.table = this.table;
    data.columns = this.table.columns || this.table.multi

    if (data.columns) {
      data.table.columnRows = {}
      data.columns.forEach(c => {
        data.table.columnRows[c] = duplicate(data.table.rows).map(r => {
          r.range = r.range[c]
          r.rangeLabel = r.range[0]
          if (r.range.length > 1)
            r.rangeLabel += ` - ${r.range[1]}`

          if (this.table.columns)
            r.label = r.name || r.description
          else if (this.table.multi)
            r.label = r[c].name || r[c].description

          r.label = TextEditor.enrichHTML(r.label)
          return r
        })
        data.table.columnRows[c] = data.table.columnRows[c].filter(r => r.range.length)
      })
    }
    data.table.rows.forEach(r => {
      r.rangeLabel = r.range[0]
      if (r.range.length > 1)
        r.rangeLabel += ` - ${r.range[1]}`
      r.label = r.name || r.description
      r.label = TextEditor.enrichHTML(r.label)
    })

    data.rollModes = CONFIG.Dice.rollModes
    data.rollMode = game.settings.get("core", "rollMode")

    return data;
  }


  // All the filter responses as well as dragging and dropping items.
  activateListeners(html) {
    super.activateListeners(html)

    html.find(".roll-table-button").click(ev => {
      let options = this._collectTableOptions(ev)
      game.wfrp4e.tables.rollToChat(this.table.key, options, null, options.rollMode)
    })
    
    html.find(".row-label").click(ev => {

      let options = this._collectTableOptions(ev)

      let index = Number(ev.target.dataset.index);
      let column = ev.target.dataset.column
      options.lookup = this.table.rows[index].range[0]
      if (column)
        options.lookup = this.table.columnRows[column][index].range[0]

      game.wfrp4e.tables.rollToChat(this.table.key, options, column, options.rollMode)
    })
  }


  _collectTableOptions(ev)
  {
    let sheet = $(ev.currentTarget).parents(".wfrp4e-table")
    let options = {}
    options.rollMode = sheet.find('[name="rollMode"]').val();
    options.modifier = Number(sheet.find('[name="tableModifier"]').val());
    options.minOne = sheet.find('[name="minOne"]').is(':checked');
    return options
  }
}