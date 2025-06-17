import CargoDialog from "./cargo-dialog"
import TradeDialog from "./trade-dialog"
import TradeGenerator from "./trade-generator"

export default class TradeManager
{
    gazetteers = {
        maritime : [],
        river : []
    }

    tradeData = {
        maritime : {},
        river : {}
    }

    seasons = {
        "spring": "Spring",
        "summer": "Summer",
        "autumn": "Autumn",
        "winter": "Winter"
    }

    get cargoTypes() {
        return foundry.utils.mergeObject(this.tradeData.maritime.cargoTypes || {}, this.tradeData.river.cargoTypes || {});
    }

    addGazzetteerFile(path, type)
    {
        fetch(path).then(r => r.json()).then(async records => {
            this.gazetteers[type] = this.gazetteers[type].concat(records)
        })
    }

    addTradeData(data, type)
    {
        foundry.utils.mergeObject(this.tradeData[type], data);
    }

    async getTradeType()
    {
        let buttons = [];

        if (this.tradeData.river?.dotr)
        {
            buttons.push({
                action : "river",
                label : game.i18n.localize("TRADE.River"),
                callback : () => "river"
            })
        }
        if (this.tradeData.maritime.soc)
        {
            buttons.push({
                action : "maritime",
                label : game.i18n.localize("TRADE.Maritime"),
                callback : () => "maritime"
            })
        }

        if (foundry.utils.isEmpty(buttons))
        {
            ui.notifications.error("No Trade Data found, see console for details");
            throw new Error("No Trade Data found: The Death on the Reik module is required for River trading, and the Sea of Claws module is required for Maritime trading. These modules provide the base data needed to compute trading results. ")
        }

        else if (buttons.length == 1)
        {
            return buttons[0]?.action;
        }

        return foundry.applications.api.DialogV2.wait({
            window : {title : "Trade"},
            content : "Choose the type of Trade",
            buttons
        })
    }

    async attemptBuy()
    {
        let type = await this.getTradeType();
        
        if (!this.gazetteers[type]?.length)
        {
            return ui.notifications.error("TRADE.ErrorNoGazetteer");
        }

        let settlementData = await new Promise(resolve => {
            new TradeDialog({cargo : null, gazetteer: this.gazetteers[type], tradeType : type}, {resolve}).render(true)
        })

        let tradeGenerator = new TradeGenerator(settlementData, type);

        tradeGenerator.attemptTrade();
        
    }  
    
    
    async attemptSell(cargo)
    {
        if (!cargo.system.cargoType.value)
        {
            return ui.notifications.error("This cargo does not have a Cargo Type defined")
        }


        let type = cargo.system.tradeType;
        
        if (!this.gazetteers[type]?.length)
        {
            return ui.notifications.error("TRADE.ErrorNoGazetteer");
        }

        let settlementData = await new Promise(resolve => {
            new TradeDialog({cargo : null, gazetteer: this.gazetteers[type], tradeType : type}, {resolve}).render(true)
        })

        let tradeGenerator = new TradeGenerator(settlementData, type)
        
        if (type == "river")
        {
            tradeGenerator.attemptSell(cargo)
        }
        else if (type == "maritime")
        {
            let far = await foundry.applications.api.DialogV2.confirm({window : {title : "Distance"}, content : `Is ${settlementData.name} over 100 miles from ${cargo.system.origin.value}?`});
            tradeGenerator.attemptSellMaritime(cargo, far);
        }
    }    


    // ************************* Old Code ************************************

    static async buyCargo(event) {

        let msgId = $(event.currentTarget).parents(".message").attr("data-message-id")
        let message = game.messages.get(msgId)

        let cargoData = message.getFlag("wfrp4e", "cargoData")
        let actor = game.user.character;
        if (!actor) return ui.notifications.error("Please assign a character.");
    
        // Perform the total amount of money to pay and get the available amount from the PCs
        let toPay
        if (cargoData.system.price.gc.toString().includes("."))
        {
          let fraction = Number("." + cargoData.system.price.gc.toString().split(".")[1])
          toPay = Math.trunc(cargoData.system.price.gc) + game.i18n.localize("MARKET.Abbrev.GC")
    
          let ss = 20 * fraction
          if (ss.toString().includes("."))
          {
            fraction = Number("." + ss.toString().split(".")[1])
            toPay += `${Math.trunc(ss)}${game.i18n.localize("MARKET.Abbrev.SS")}`
            let bp = Math.round(12 * fraction)
            if (bp)
              toPay += `${bp}${game.i18n.localize("MARKET.Abbrev.BP")}`
          }
          else toPay += `${ss}${game.i18n.localize("MARKET.Abbrev.SS")}`
        }
        else toPay = `${cargoData.system.price.gc}${game.i18n.localize("MARKET.Abbrev.GC")}`
    
    
        // Check if enough money or not
        let newMoneyInventory = game.wfrp4e.market.payCommand(toPay, actor)
        if (newMoneyInventory) 
        {
          actor.updateEmbeddedDocuments("Item", newMoneyInventory);
    
          cargoData.type = "cargo";
          cargoData.img = "modules/wfrp4e-dotr/assets/icons/cargo.png";
          let itemCargo = await Item.create(cargoData, { temporary: true })
          itemCargo.postItem(1);
        }
      }

      static async manageTrade(cargoData) 
      {
        cargoData.modifier = 0;
        new CargoDialog(cargoData).render(true);
      }
   
}