import OpposedHandler from "../../system/opposed-handler";

let fields = foundry.data.fields;
export class OpposedHandlerMessage extends WarhammerMessageModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.opposedData = new fields.ObjectField();
        return schema;
    }

    get opposedHandler() 
    {
        return new OpposedHandler(this.opposedData, this.parent);
    }

    static get actions() 
    { 
        return foundry.utils.mergeObject(super.actions, {
            clickOpposedToggle : this.onClickOpposedToggle,
            clickOpposedImg : this.onClickOpposedImg,
            clickOpposedResponse : this.onClickOpposedResponse
        });
    }

    async onRender(html)
    {
      warhammer.utility.replacePopoutTokens(html);
    }

    /**
     * The opposed button was clicked, evaluate whether it is an attacker or defender, then proceed
     * to evaluate if necessary.
     */
    static async clickManualOpposed(message) {

        if (game.wfrp4e.oppose && !game.wfrp4e.oppose.attackerMessage) 
        {
            delete game.wfrp4e.oppose;
        }

        // Opposition already exists - click was defender
        if (game.wfrp4e.oppose) 
        {
            await game.wfrp4e.oppose.setDefender(message);
            await game.wfrp4e.oppose.renderMessage() // Rerender opposed start with new message
            await game.wfrp4e.oppose.computeOpposeResult();
            delete game.wfrp4e.oppose;
        }
        // No opposition - click was attacker
        else 
        {
            game.wfrp4e.oppose = new OpposedHandler()
            await game.wfrp4e.oppose.setAttacker(message);
            await game.wfrp4e.oppose.renderMessage()
        }

    }

    static onClickOpposedImg(ev, target)
    {
        let side = target.dataset.side;
        this.opposedHandler[side]?.sheet.render(true);
    }

    static onClickOpposedResponse(ev, target)
    {
        let id = target.dataset.itemId;
        this.opposedHandler.resolveOpposed(id);
    }
}