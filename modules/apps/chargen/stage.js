import WFRP_Utility from "../../system/utility-wfrp4e.js";



export class ChargenStage extends FormApplication {
  active = false;
  html = "";
  data = {};
  context = {};
  journalId = ""

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.id = "chargen-stage";
    options.classes = options.classes.concat("wfrp4e", "chargen");
    options.width = 1000;
    options.height = 600;
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.Title");
    options.scrollY = [".chargen-content"]
    return options;
  }

  
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
      buttons.unshift(
        {
          class: "help",
          icon: "fa-solid fa-circle-question",
          onclick: async ev => this.renderJournalPage()
        })
    return buttons
  }

  async renderJournalPage()
  {
    let journalPage = await fromUuid(this.journalId)

    if (journalPage)
    {
      await journalPage.parent.sheet._render(true)
      journalPage.parent.sheet.goToPage(journalPage.id)
    }

  }


  constructor(object, options) {
    super(object, options);
    this.data = object;
  }

  async getData() {
    return { data: this.data, context: this.context };
  }

  validate() {
    return false;
  }


  // HTML to add to the char gen application
  async addToDisplay() {
    return null
  }

  _updateObject(event, formData) {
    this.options.complete(this.options.index);
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", '.chargen-button, .chargen-button-nostyle', this.onButtonClick.bind(this));
    html.on("contextmenu", '.item-lookup', this._onItemLookupClicked.bind(this));

    // Autoselect entire text 
    html.find("input").on("focusin", ev => {
      ev.target.select();
    });
  }


  onButtonClick(ev) {
    let type = ev.currentTarget.dataset.button;
    if (typeof this[type] == "function") {
      this[type](ev);
    }
  }

  async _onItemLookupClicked(ev) {
    let itemType = $(ev.currentTarget).attr("data-type");
    let openMethod = $(ev.currentTarget).attr("data-open") || "sheet"; // post or sheet
    let name = $(ev.currentTarget).attr("data-name") || ev.currentTarget.text; // Use name attribute if available, otherwis, use text clicked.
    let item;
    if (name)
      item = await WFRP_Utility.find(name, itemType);

    if (item) {
      if (openMethod == "sheet")
        item.sheet.render(true);

      else
        item.postItem();
    }
  }



}
