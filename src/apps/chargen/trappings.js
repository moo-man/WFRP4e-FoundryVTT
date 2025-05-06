import WFRP_Utility from "../../system/utility-wfrp4e.js";
import { ChargenStage } from "./stage.js";

export class TrappingStage extends ChargenStage {
  journalId = "Compendium.wfrp4e-core.journals.JournalEntry.IQ0PgoJihQltCBUU.JournalEntryPage.hQipqLYlbBEjJEWL"
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 450;
    options.height = 600;
    options.classes.push("trappings");
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.StageTrappings");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageTrappings"); }

  get template() {
    return "systems/wfrp4e/templates/apps/chargen/trappings.hbs";
  }

  constructor(...args) {
    super(...args);

    this.context.classStrings = game.wfrp4e.config.classTrappings[this.data.items.career.system.class.value]?.split(",") || [];
    this.context.careerStrings = this.data.items.career.system.trappings;

    if (this.context.classStrings.length == 0) {
      this.showError("ClassTrappingsNotFound", { class: this.data.items.career.system.class.value })
    }

    this.context.class = Promise.all(this.context.classStrings.map(i => WFRP_Utility.find(i.trim(), game.wfrp4e.config.trappingItems)));
    this.context.career = Promise.all(this.context.careerStrings.map(i => WFRP_Utility.find(i, game.wfrp4e.config.trappingItems)));
    this.context.income = {};
  }

  context = {
    items: [],
    class: [],
    career: [],
    missing: null,
    added: []
  };

  async getData() {
    let data = await super.getData();
    this.context.class = await this.context.class;
    this.context.career = await this.context.career;

    if (!this.context.missing) {
      this.context.missing = [];

      this.context.class.forEach((trapping, i) => {
        if (!trapping) {
          this.context.missing.push({
            string: this.context.classStrings[i],
            choice: "keep"
          });
        }
      });

      this.context.career.forEach((trapping, i) => {
        if (!trapping) {
          this.context.missing.push({
            string: this.context.careerStrings[i],
            choice: "keep"
          });
        }
      });
    }

    this.context.class = this.context.class.filter(i => i);
    this.context.career = this.context.career.filter(i => i);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    const dragDrop = new foundry.applications.ux.DragDrop.implementation({
      dropSelector: '.chargen-content',
      permissions: { drop: () => true },
      callbacks: { drop: this._onDrop.bind(this) },
    });

    dragDrop.bind(html[0]);

    html.find(".missing-trapping-choice input").click(ev => {
      let name = ev.currentTarget.name;
      let index = Number(name.split("-")[1]);
      this.context.missing[index].choice = ev.currentTarget.value;
      this.render(true);
    });

    html.find(".remove-trapping").click(ev => {
      let index = Number(ev.currentTarget.dataset.index);
      this.context.added.splice(index, 1)
      this.render(true);
    })

  }

  async onRollIncome()
  {
    this.context.income = await game.wfrp4e.market.rollIncome(this.data.items.career);
    this.updateMessage("Income", { name: this.context.income.item.name, quantity  : this.context.income.item.system.quantity.value })
    this.render(true);
  }

  async _onDrop(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

    if (dragData.type == "Item") {
      this.context.added.push(await Item.implementation.fromDropData(dragData));
    }
    this.render(true);
  }

  _updateObject(ev, formData) {

    // Of the trappings not found, only keep the ones that are marked as "keep", and create a new miscellaneous trapping item for them
    let missing = this.context.missing.filter(i => i.choice == "keep").map(i => new Item.implementation({ name: i.string, img : "systems/wfrp4e/icons/blank.png", type: "trapping", system: { "trappingType.value": "misc" } }));

    this.data.items.trappings = missing.concat(this.context.class, this.context.career, this.context.added);
    this.data.items.income = this.context.income.item;
    super._updateObject(ev, formData)
  }
}
