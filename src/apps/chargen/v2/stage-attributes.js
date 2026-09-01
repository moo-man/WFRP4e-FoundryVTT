export class AttributesStage extends BaseCharacterCreationStage
{
    static DEFAULT_OPTIONS = 
        {
            tag: "form",
            classes : ["attributes", "wfrp4e"],
            window : {
                title : "WH.CharacterCreation.Stage",
                contentClasses : ["standard-form"],
                frame: false,
                positioned: false
            },
            position : {
            },
            actions : {
              rollCharacteristics: this._onRollCharacteristics,
              swapCharacteristics: this._onSwapCharacteristics,
              allocateCharacteristics: this._onAllocateCharacteristics
            },
            dragDrop: [{ dragSelector: ".char-drag", dropSelector: ".char-value" }]

        };

    static PARTS = {
        attributes : {template : "systems/wfrp4e/templates/apps/chargen/v2/stages/attributes.hbs"},
        result : {
          template : "systems/wfrp4e/templates/apps/chargen/v2/stage-result.hbs"
        }
    };

    handleStageArgs({species, career})
    {
        this.data.species = new Item.implementation(species);
        this.data.career = new Item.implementation(career);
        this.data.characteristics = {};
        let speciesCharacteristics = this.data.species.system.characteristics;
        for(let c in this.data.species.system.characteristics)
        {
          this.data.characteristics[c] = {
            roll: null,
            formula: `${speciesCharacteristics[c].dice}d10`,
            base:  speciesCharacteristics[c].base,
            allocated: 0,
          }
        }
        this.data.rolled = false;
        this.data.swapping = false;
        this.data.rerolled = false;
        this.data.allocating = false;
        this.data.allocated = 0;
        this.data.meta = {
          extra: this.data.species.system.extra,
          available: this.data.species.system.extra,
          fate: {
            species: this.data.species.system.fate,
            allocated: 0
          },
          resilience: {
            species: this.data.species.system.resilience,
            allocated: 0
          }
        }

        this.data.advances = Object.keys(this.data.career.system.characteristics).reduce((obj, c) => {
          if (this.data.career.system.characteristics[c])
          {
            obj[c] = 0
          }
          return obj;
        }, {})
    }

    async getStageResults() 
    {
        let result = {
          system: {
            characteristics: {
              
            },
            status: {
              fate: {},
              resilience: {}
            },
            details: {
              experience: {current: this._computeXP()}
            }
          },
        }

        for(let c in this.data.characteristics)
        {
          result.system.characteristics[c] = {
            initial: this.data.characteristics[c].total,
            advances: this.data.advances[c] || 0
          }
        }

        result.system.status.fate.value = this.data.meta.fate.total;
        result.system.status.resilience.value = this.data.meta.resilience.total;

        return result;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        this.computeCharacteristics();
        this.computeMetacurrencies();
        return context;
    }

    async _preparePartContext(partId, context, options) {
      await super._preparePartContext(partId, context, options);
      if (partId == "result")
      {
        context.xp = this._computeXP();
      }
      return context;
    }

    _computeXP()
    {
      let xp;
      if (this.data.rolled)
      {
        xp = 50;
      }
      if (this.data.swapping)
      {
        xp = 25;
      }
      if (this.data.rerolled || this.data.allocating)
      {
        xp = 0;
      }
      return xp;
    }


    computeCharacteristics()
    {
      if (this.data.rolled)
      {
        for(let c in this.data.characteristics)
        {
          this.data.characteristics[c].total = this.data.characteristics[c].roll + this.data.characteristics[c].base
        }
      }
      if (this.data.allocating)
      {
        for(let c in this.data.characteristics)
        {
          this.data.characteristics[c].total = this.data.characteristics[c].allocated + this.data.characteristics[c].base
        }
      }
    }

    computeMetacurrencies()
    {
        this.data.meta.fate.total = this.data.meta.fate.species + this.data.meta.fate.allocated;
        this.data.meta.resilience.total = this.data.meta.resilience.species + this.data.meta.resilience.allocated;
    }

    static async _onRollCharacteristics(ev, target)
    {
      if (this.data.rolled)
      {
        this.data.rerolled = true;
      }
      else 
      {
        this.data.rolled = true;
      }
      for(let c in this.data.characteristics)
      {
        this.data.characteristics[c].roll = (await new Roll(`${this.data.characteristics[c].formula}`).roll()).total;
        this.data.characteristics[c].original = this.data.characteristics[c].roll;
      }

      this.data.allocating = false;
      this.data.swapping = false;

      this.render({force: true})
    }

    static async _onSwapCharacteristics(ev, target)
    {
      this.data.swapping = true;
      this.data.allocating = false;
      this.render({force: true})
    }


    static async _onAllocateCharacteristics(ev, target)
    {
      this.data.allocating = true;
      this.data.swapping = false;
      this.render({force: true})
    }

    _onDragStart(ev)
    {
      ev.dataTransfer.setData("text/plain", JSON.stringify({type: "Characteristic", key: ev.target.dataset.key}));
    }

    async _onDropCharacteristic(dropData, ev)
    {
      let swap1 = dropData.key;
      let swap2 = ev.target.dataset.key;
      let value1 = this.data.characteristics[swap1].roll;
      let value2 = this.data.characteristics[swap2].roll;

      this.data.characteristics[swap2].roll = value1;
      this.data.characteristics[swap1].roll = value2;

      this.render({force: true})
    }

    _addEventListeners()
    {
      this.element.querySelectorAll("[data-allocate]").forEach(el => {
        el.addEventListener("focusin", (ev) => ev.target.select())
        el.addEventListener("change", (ev) => {
          let value = Math.max(0, Number(ev.target.value));
          this.data.characteristics[ev.target.dataset.allocate].allocated = value;
          this.data.characteristics[ev.target.dataset.allocate].invalid = (value > 18 || value < 4);
          this.data.allocated = Object.values(this.data.characteristics).reduce((sum, c) => sum + c.allocated, 0);
          this.data.overallocated = this.data.allocated > 100;
          this.render({force: true});
        })
      })

      this.element.querySelectorAll("[data-meta]").forEach(el => {
        el.addEventListener("focusin", (ev) => ev.target.select())
        el.addEventListener("change", (ev) => {
          let value = Math.max(0, Number(ev.target.value));
          this.data.meta[ev.target.dataset.meta].allocated = value;
          this.data.meta.available = this.data.meta.extra - (this.data.meta.fate.allocated + this.data.meta.resilience.allocated)
          this.render({force: true});
        })
      })

      this.element.querySelectorAll("[data-advance]").forEach(el => {
        el.addEventListener("focusin", (ev) => ev.target.select())
        el.addEventListener("change", (ev) => {
          let value = Math.max(0, Number(ev.target.value));
          this.data.advances[ev.target.dataset.advance] = value;
          this.render({force: true});
        })
      })
    }

}