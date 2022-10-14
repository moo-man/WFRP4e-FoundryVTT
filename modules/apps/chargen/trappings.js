import WFRP_Utility from "../../system/utility-wfrp4e.js";
import ItemWfrp4e from "../../item/item-wfrp4e.js";
import { ChargenStage } from "./stage";

export class TrappingStage extends ChargenStage {
  journalId = "Compendium.wfrp4e-core.journal-entries.IQ0PgoJihQltCBUU.JournalEntryPage.hQipqLYlbBEjJEWL"
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
    return "systems/wfrp4e/templates/apps/chargen/trappings.html";
  }



  constructor(...args) {
    super(...args);

    this.context.classStrings = game.wfrp4e.config.classTrappings[this.data.items.career.system.class.value + "s"]?.split(",") || [];
    this.context.careerStrings = this.data.items.career.system.trappings;

    this.context.class = Promise.all(game.wfrp4e.config.classTrappings[this.data.items.career.system.class.value + "s"].split(",").map(i => WFRP_Utility.find(i.trim(), "trapping")));
    this.context.career = Promise.all(this.data.items.career.system.trappings.map(i => WFRP_Utility.find(i, "trapping")));
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

    //TODO error for class strings
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
    const dragDrop = new DragDrop({
      dropSelector: '.chargen-content',
      permissions: { drop: () => true },
      callbacks: { drop: this._onDrop.bind(this) },
    });

    dragDrop.bind(html[0]);

    html.find(".missing-trapping-choice").click(ev => {
      let name = ev.currentTarget.name;
      let index = Number(name.split("-")[1]);
      this.context.missing[index].choice = ev.currentTarget.value;
      this.render(true);
    });
  }

  async _onDrop(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

    if (dragData.type == "Item") {
      this.context.added.push(await Item.implementation.fromDropData(dragData));
    }
    this.render(true);
  }


  _updateObject(ev, formData) {
    let missing = this.context.missing.filter(i => i.choice == "keep").map(i => new ItemWfrp4e({ name: i.string, type: "trapping", system: { "trappingType.value": "misc" } }));

    this.data.items.trappings = missing.concat(this.context.class, this.context.career, missing, this.context.added);
  }
}
