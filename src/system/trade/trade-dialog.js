
/************************************************************************************/
export default class TradeDialog extends Dialog {

    constructor(cargo, gazetteer, tradeType, resolve)
    {
        let dialogContent = {
          title : game.i18n.localize("TRADE.SettlementDetails"),
          buttons : {
            ok : {
              label : "Ok",
              callback : (dlg) => {
                let settlementData = {}
  
                let settlementIndex = dlg.find('[name="settlement"]').val();
                let season = dlg.find('[name="season"]').val()
                if (Number.isNumeric(settlementIndex))
                {
                  let selected = this.gazetteer[Number(settlementIndex)]
                  settlementData = {
                    wealth : Number(selected.w),
                    size : Number(selected),
                    trade : selected.isTrade,
                    produces : selected.produces,
                    season
                  }
                }
                settlementData.name = dlg.find('[name="name"]').val();
                settlementData.wealth = Number(dlg.find('[name="wealth"]').val());
                settlementData.size = Number(dlg.find('[name="size"]').val());
                settlementData.trade = dlg.find('[name="trade"]').is(':checked');
                settlementData.season = season;
                settlementData.produces = dlg.find('[name="produces"]').val().split(",").map(i=> {
                  i = i.trim();
                  return warhammer.utility.findKey(i.split("(")[0].trim(), game.wfrp4e.trade.tradeData[tradeType].cargoTypes)
                }).filter(i => !!i);

                settlementData.surplus = this.encodeSurplusDemand(dlg.find('[name="surplus"]').val())
                settlementData.demand = this.encodeSurplusDemand(dlg.find('[name="demand"]').val())

                resolve(settlementData)
              }
            }
          }
        }
        super(dialogContent)

        if (game.modules.get("foundryvtt-simple-calendar")?.active) 
        {
            this.season = SimpleCalendar.api.getCurrentSeason();
            if (this.season == "fall")
            {
                this.season = "autumn"
            }
        }
        this.tradeType = tradeType;
        this.cargo = cargo;
        this.gazetteer = gazetteer
    }
  
  
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
          template: "systems/wfrp4e/templates/apps/trade/trade-dialog.hbs",
      });
    }
  
    getData() {
      let data = super.getData();
      data.cargo = this.cargoData
      data.gazetteer = this.gazetteer
      data.tradeType = this.tradeType;
      data.seasons = game.wfrp4e.trade.seasons
      return data
    }
  
    /* -------------------------------------------- */
    activateListeners(html) {
      super.activateListeners(html);
  
      this.settlement = html.find("#settlement").change(ev => {
        if (ev.target.value != "")
        {
          let index = Number(ev.target.value);
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
      })[0]
  
      this.wealth = html.find("#wealth").change(ev => {
        this.settlement.value = ""
      })[0]
  
      this.size = html.find("#size").change(ev => {
        this.settlement.value = ""
      })[0]
  
      this.produces = html.find("#produces").change(ev => {
        this.settlement.value = ""
      })[0]
  
      this.surplus = html.find("#surplus").change(ev => {
        this.settlement.value = ""
      })[0]

      this.demand = html.find("#demand").change(ev => {
        this.settlement.value = ""
      })[0]

      this.trade = html.find("#trade").change(ev => {
        this.settlement.value = ""
      })[0]
  
      this.name = html.find("#name").change(ev => {
        this.settlement.value = ""
      })[0]

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
  
