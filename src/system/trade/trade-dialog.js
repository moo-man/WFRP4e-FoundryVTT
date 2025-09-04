export default class TradeDialog extends HandlebarsApplicationMixin(ApplicationV2)
{
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes : ["warhammer"],
    window: {
      title: "Trade",
      contentClasses: ["standard-form"]
    },
    form: {
      submitOnChange: false,
      closeOnSubmit : true,
      handler : this._onSubmit
    }

  }

    /** @override */
    static PARTS = {
      form: {
        template: "systems/wfrp4e/templates/apps/trade/trade-dialog.hbs",
        scrollable: [""],
        classes : ["standard-form"]
      },
      footer: {
        template: "templates/generic/form-footer.hbs"
      }
    };


    constructor(tradeData, options)
    {
      super(options)

      if (game.modules.get("foundryvtt-simple-calendar")?.active) 
      {
          this.season = SimpleCalendar.api.getCurrentSeason();
          if (this.season == "fall")
          {
              this.season = "autumn"
          }
      }
      this.tradeType = tradeData.tradeType;
      this.cargo = tradeData.cargo;
      this.gazetteer = tradeData.gazetteer
    }

    async _prepareContext(options) {
      let context = await super._prepareContext(options);
      context.cargo = this.cargoData
      context.gazetteer = this.gazetteer
      context.settlements = this.gazetteer.map(i => i.name);
      context.tradeType = this.tradeType;
      context.seasons = game.wfrp4e.trade.seasons
      context.buttons = [{ type: "submit", label: "Submit", icon: "fa-solid fa-save" }]
      return context
    }

    static _onSubmit(ev, form, formData)
    {
      let settlementData = {}
  
      let settlementIndex = formData.object.settlement
      let season = formData.object.season
      if (Number.isNumeric(settlementIndex))
      {
        let selected = this.gazetteer[Number(settlementIndex)]
        settlementData = {
          wealth : Number(selected.w),
          size : Number(selected.size),
          trade : selected.isTrade,
          produces : selected.produces,
          season
        }
      }
      settlementData.name = formData.object.name;
      settlementData.wealth = Number(formData.object.wealth);
      settlementData.size = Number(formData.object.size);
      settlementData.trade = formData.object.trade;
      settlementData.season = season;
      settlementData.produces = formData.object.produces.split(",").map(i=> {
        i = i.trim();
        return warhammer.utility.findKey(i.split("(")[0].trim(), game.wfrp4e.trade.tradeData[this.tradeType].cargoTypes)
      }).filter(i => !!i);

      settlementData.surplus = this.encodeSurplusDemand(formData.object.surplus)
      settlementData.demand = this.encodeSurplusDemand(formData.object.demand)

      this.options.resolve(settlementData)
      return settlementData;
    }

  
    /* -------------------------------------------- */
    async _onRender(options) {
      super._onRender(options);

  
      this.settlement = this.element.querySelector("[name='settlement']")
      this.settlement.addEventListener("change", ev => {
        if (ev.target.value != "")
        {
          let index = ev.target.selectedIndex - 1;
          this.wealth.value = this.gazetteer[index].w
          this.size.value = this.gazetteer[index].size
          this.produces.value = this.gazetteer[index].produces.map(i => this.formatCargoType(i) || i).join(", ")
          if (this.surplus)
          {
            this.surplus.value = this.formatSurplusDemand(this.gazetteer[index].surplus)
          }
          if (this.demand)
          {
            this.demand.value = this.formatSurplusDemand(this.gazetteer[index].demand)
          }
          this.trade.checked = this.gazetteer[index].isTrade
          this.name.value = this.gazetteer[index].name
        }
      })
  
      this.wealth = this.element.querySelector("[name='wealth']");
      this.wealth.addEventListener("change", this._clearSettlement.bind(this))
  
      this.size = this.element.querySelector("[name='size']");
      this.size.addEventListener("change", this._clearSettlement.bind(this))
  
      this.produces = this.element.querySelector("[name='produces']");
      this.produces.addEventListener("change", this._clearSettlement.bind(this))
  
      this.surplus = this.element.querySelector("[name='surplus']");
      this.surplus?.addEventListener("change", this._clearSettlement.bind(this))

      this.demand = this.element.querySelector("[name='demand']");
      this.demand?.addEventListener("change", this._clearSettlement.bind(this))

      this.trade = this.element.querySelector("[name='trade']");
      this.trade.addEventListener("change", this._clearSettlement.bind(this))
  
      this.name = this.element.querySelector("[name='name']");
      this.name.addEventListener("change", this._clearSettlement.bind(this))

    }

    _clearSettlement()
    {
      this.settlement.value = "";
    }


    // This is all really gross but I don't have time to clean it up right now
    formatCargoType(string)
    {
      if (string.includes("("))
      {
        let parenthesesValue = string.split("(")[1].split(")")[0];
        let name = string.split("(")[0].trim(0);
        return `${game.wfrp4e.trade.tradeData[this.tradeType].cargoTypes[name]} (${parenthesesValue})`;
      }
      else 
      {
        return game.wfrp4e.trade.tradeData[this.tradeType].cargoTypes[string]
      }
    }

    formatSurplusDemand(values)
    {
      if (values?.length)
      {
        let strings = []
        for(let text of values)
        {
          let [name, value]= text.split("+").map(i => i.trim())
          name = this.formatCargoType(name);
          
          strings.push(`${name} +${value}`)
          
        }
        return strings.join(", ");
      }
      else return "";
    }

    encodeSurplusDemand(string)
    {
      if (!string)
      {
        return [];
      }
      let encoded = []
      let strings = string.split(",").map(i => i.trim());

      for(let string of strings)
      {
        let value = string.split("+")[1].trim();
        let key;
        let parenValue; 
        if (string.includes("("))
        {
          key = string.split("(")[0].trim();
          parenValue = string.split("(")[1].split(")")[0];

          key = warhammer.utility.findKey(key, game.wfrp4e.trade.tradeData[this.tradeType].cargoTypes)

        }
        else 
        {
          key = warhammer.utility.findKey(string.split("+")[0].trim(), game.wfrp4e.trade.tradeData[this.tradeType].cargoTypes)
        }

        encoded.push(`${key} +${value}`)
      }
      return encoded;

    }
  }
  
