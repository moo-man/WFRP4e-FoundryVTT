
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
                  return game.wfrp4e.utility.findKey(i, game.wfrp4e.trade.tradeData[tradeType].cargoTypes)
                }).filter(i => !!i);
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
        return mergeObject(super.defaultOptions, {
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
          this.produces.value = this.gazetteer[index].produces.map(i => game.wfrp4e.trade.tradeData[this.tradeType].cargoTypes[i] || i).join(", ")
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
  
      this.trade = html.find("#trade").change(ev => {
        this.settlement.value = ""
      })[0]
  
      this.name = html.find("#name").change(ev => {
        this.settlement.value = ""
      })[0]

    //   html.find('[name="season"]').change(ev => {
    //     this.season = ev.currentTarget.value;
    //   })


    }
  
  }
  