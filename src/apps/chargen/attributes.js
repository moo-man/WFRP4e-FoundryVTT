import { ChargenStage } from "./stage";

const Step = {NOT_STARTED : 0, FIRST_ROLL : 1, SWAPPING : 2, REROLL : 3, ALLOCATING : 4}

export class AttributesStage extends ChargenStage {

  journalId = "Compendium.wfrp4e-core.journals.JournalEntry.IQ0PgoJihQltCBUU.JournalEntryPage.GaZa9sU4KjKDswMr"
  static get defaultOptions() {
  const options = super.defaultOptions;
    options.resizable = true;
    options.width = 400;
    options.height = 785;
    options.classes.push("career");
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.StageAttributes");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageAttributes"); }
  get template() { return "systems/wfrp4e/templates/apps/chargen/attributes.hbs"; }



  constructor(...args) {
    super(...args);

    // Step 1: First roll, Step 2: Swapping, Step 3: Reroll, Step 4: Allocating 
    this.context.step = Step.NOT_STARTED;
    this.context.characteristics = {
      ws: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      bs: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      s: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      t: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      i: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      ag: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      dex: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      int: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      wp: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      fel: { formula: "", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
    },
      this.context.allocation = {
        total: 100,
        spent: 0
      };
    this.context.meta = {
      fate: { base: 0, allotted: 0, total: 0 },
      resilience: { base: 0, allotted: 0, total: 0 },
      extra: 0,
      left: 0
    };
    this.context.move = 4;
    this.context.exp = 50;
  }

  async getData() {
    let data = await super.getData();
    this.calculateTotals();

    if (this.context.step <= Step.FIRST_ROLL) {
      this.context.exp = 50;
    }
    else if (this.context.step == Step.SWAPPING && !this.context.hasRerolled) {
      this.context.exp = 25;
    }

    else
      this.context.exp = 0;

    return data;
  }

  async rollAttributes(ev, step) {
    if (step)
      this.context.step = step;
    else
      this.context.step++;

    if (this.context.step == Step.FIRST_ROLL)
    {
      await this.updateMessage("RolledCharacteristics")
    }
    else if (this.context.step == Step.REROLL)
    {
      await this.updateMessage("ReRolledCharacteristics")
    }

    let species = this.data.species;
    let subspecies = this.data.subspecies;

    let characteristicFormulae = game.wfrp4e.config.speciesCharacteristics[species];
    if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].characteristics)
      characteristicFormulae = game.wfrp4e.config.subspecies[species][subspecies].characteristics;

    for (let ch in this.context.characteristics) {
      let [roll, bonus] = characteristicFormulae[ch].split("+").map(i => i.trim());
      roll = roll || "2d10";
      bonus = bonus || 0;
      this.context.characteristics[ch].formula = characteristicFormulae[ch];
      this.context.characteristics[ch].roll = (await new Roll(roll).roll()).total;
      this.context.characteristics[ch].add = bonus;
      this.context.characteristics[ch].allocated = 0;
    }

    this.context.rolledCharacteristics = foundry.utils.duplicate(this.context.characteristics) // Used to restore roll if user goes back a step

    this.context.movement = game.wfrp4e.config.subspecies[species]?.[subspecies]?.movement ?? game.wfrp4e.config.speciesMovement[species];
    this.context.meta.fate.base = game.wfrp4e.config.subspecies[species]?.[subspecies]?.fate ?? game.wfrp4e.config.speciesFate[species];
    this.context.meta.resilience.base = game.wfrp4e.config.subspecies[species]?.[subspecies]?.resilience ?? game.wfrp4e.config.speciesRes[species];
    this.context.meta.extra = game.wfrp4e.config.subspecies[species]?.[subspecies]?.extra ?? game.wfrp4e.config.speciesExtra[species];

    this.calculateTotals();

    this.updateMessage(undefined, undefined, `
    <div class="flexcol" style="text-align: center">
      <div class="flexrow">
        <div>
          ${Object.keys(this.context.characteristics)
            .map(i => game.wfrp4e.config.characteristicsAbbrev[i])
            .join("</div><div>")
          }
        </div>
      </div>
      <div class="flexrow">
        <div>
        ${Object.values(this.context.characteristics)
          .map(i => i.total)
          .join("</div><div>")
        }
        </div>
      </div>
    </div>
    `)

    this.render();
  }

  calculateTotals() {
    this.context.allocation.spent = 0;
    this.context.advances = 0
    for (let ch in this.context.characteristics) {
      let characteristic = this.context.characteristics[ch];
      let base = this.context.step == Step.ALLOCATING ? characteristic.allocated : characteristic.roll
      characteristic.initial = base + Number(characteristic.add);
      characteristic.total = characteristic.initial + Number(characteristic.advances);
      this.context.allocation.spent += characteristic.allocated;
      this.context.advances += Number(characteristic.advances) // Used for validation, cannot be above 5
    }
    let fate = this.context.meta.fate;
    let resilience = this.context.meta.resilience;
    fate.total = fate.base + fate.allotted;
    resilience.total = resilience.base + resilience.allotted;
    this.context.meta.left = this.context.meta.extra - (resilience.allotted + fate.allotted);
  }

  validateTotals() {
    this.calculateTotals()
    let valid = true
    if (this.context.meta.left < 0)
    {
      this.showError("MetaAllocation")
      valid = false
    }
    if (this.context.allocation.spent > 100)
    {
      this.showError("CharacteristicAllocation")
      valid = false
    }

    if (this.context.advances > 5)
    {
      this.showError("CharacteristicAdvances")
      valid = false
    }

    if (this.context.step == Step.ALLOCATING)
    {
      let inBounds = true
      for (let ch in this.context.characteristics) {
        let characteristic = this.context.characteristics[ch];
        if (characteristic.allocated < 4 || characteristic.allocated > 18)
          inBounds = false
      }

      if(!inBounds)
      {
        this.showError("CharacteristicAllocationBounds")
        valid = false;
      }
    }


    return valid
  }

  validate() {
    return super.validate() && this.validateTotals();
  }

  swap(ch1, ch2) {
    if (this.context.step < Step.SWAPPING)
      this.context.step = Step.SWAPPING;

    let ch1Roll = foundry.utils.duplicate(this.context.characteristics[ch1].roll);
    let ch2Roll = foundry.utils.duplicate(this.context.characteristics[ch2].roll);

    this.context.characteristics[ch1].roll = ch2Roll;
    this.context.characteristics[ch2].roll = ch1Roll;

    this.updateMessage("SwappedCharacteristics", {ch1 : game.wfrp4e.config.characteristics[ch1], ch2: game.wfrp4e.config.characteristics[ch2]})

    this.render(true);
  }

  activateListeners(html) {
    super.activateListeners(html);
    const dragDrop = new DragDrop({
      dragSelector: '.ch-drag',
      dropSelector: '.ch-drag',
      permissions: { dragstart: () => true, drop: () => true },
      callbacks: { drop: this.onDropCharacteristic.bind(this), dragstart: this.onDragCharacteristic.bind(this) },
    });

    dragDrop.bind(html[0]);


    html.find(".meta input").on("change", (ev) => {
      // Bind value to be nonnegative
      ev.currentTarget.value = Math.max(0, Number(ev.currentTarget.value))
      this.context.meta[ev.currentTarget.dataset.meta].allotted = Number(ev.currentTarget.value);
      this.render(true);
    });

    html.find(".ch-allocate").on("change", (ev) => {
      // Bind value to be nonnegative
      ev.currentTarget.value = Math.max(0, Number(ev.currentTarget.value))
      if (ev.currentTarget.value > 18 || ev.currentTarget.value < 4)
      {
        this.showError("CharacteristicAllocationBounds")
        ev.currentTarget.value = 0
        return 
      }
      this.context.characteristics[ev.currentTarget.dataset.ch].allocated = Number(ev.currentTarget.value);
      this.render(true);
    });

    html.find(".ch-advance").on("change", ev => {
      // Bind value to be nonnegative
      ev.currentTarget.value = Math.max(0, Number(ev.currentTarget.value))
      this.context.characteristics[ev.currentTarget.dataset.ch].advances = Number(ev.currentTarget.value);
      this.render(true);
    });
  }

  reroll(ev) {
    this.context.hasRerolled = true
    // Set to step 3
    this.rollAttributes(ev, 3);
  }

  allocate(ev) {
    this.context.step = Step.ALLOCATING;
    this.updateMessage("AllocateCharacteristics")

    this.render(true);
  }

  rearrange(ev)
  {
    this.context.step = Step.SWAPPING
    this.render(true);
  }

  // Cancel allocation or swapping, restore to the last rolled characteristic
  cancel(ev)
  {
    if (this.context.hasRerolled)
    this.context.step = Step.REROLL
    else 
      this.context.step = Step.FIRST_ROLL
    this.context.characteristics = foundry.utils.duplicate(this.context.rolledCharacteristics)
    this.render(true)
  }

  _updateObject(ev, formData) {
    for (let ch in this.context.characteristics) {
      this.data.characteristics[ch] = { initial: this.context.characteristics[ch].initial, advances: this.context.characteristics[ch].advances };
    }
    this.data.fate.base = this.context.meta.fate.base;
    this.data.fate.allotted = this.context.meta.fate.allotted;
    this.data.resilience.base = this.context.meta.resilience.base;
    this.data.resilience.allotted = this.context.meta.resilience.allotted;
    this.data.move = game.wfrp4e.config.speciesMovement[this.data.species];
    this.data.exp.characteristics = this.context.exp;
    super._updateObject(ev, formData)
  }

  onDragCharacteristic(ev) {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ ch: ev.currentTarget.dataset.ch }));
  }

  onDropCharacteristic(ev) {
    if (ev.currentTarget.dataset.ch) {
      let ch = JSON.parse(ev.dataTransfer.getData("text/plain")).ch;
      this.swap(ev.currentTarget.dataset.ch, ch);
    }
  }
}
