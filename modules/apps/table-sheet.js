export default class WFRP4eTableSheet extends Application {
  constructor(table, app) {
    super(app)

    this.table = table
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "wfrp4e-table  ";
    options.template = "systems/wfrp4e/templates/apps/table-sheet.html"
    options.classes.push("wfrp4e", "table-sheet");
    options.resizable = true;
    options.height = 900;
    options.width = 600;
    options.minimizable = true;
    options.title = "WFRP4e Table"
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
    data.table.rows.forEach(r => {
      r.rangeLabel = `${r.range[0]} - ${r.range[1]}`
      r.label = r.name || r.description
      r.label = TextEditor.enrichHTML(r.label)
    })
    return data;
  }


  // All the filter responses as well as dragging and dropping items.
  activateListeners(html) {
    super.activateListeners(html)

    html.find(".roll-table-button").click(ev => {
      game.wfrp4e.tables.rollToChat(this.table.key)
    })
    
    html.find(".row-label").click(ev => {
      let index = Number(ev.target.dataset.index);
      let lookup = this.table.rows[index].range[0]
      game.wfrp4e.tables.rollToChat(this.table.key, {lookup})
    })
  }
}