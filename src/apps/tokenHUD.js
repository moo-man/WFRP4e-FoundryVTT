export default class WFRPTokenHUD extends TokenHUD {


  _onToggleEffect = function (event, { overlay = false } = {}) {
    event.preventDefault();
    event.stopPropagation();
    let img = event.currentTarget;

    let actor = this.object?.actor;
    if (!actor) return;

    if (event.button == 0)
    {
        return actor.addCondition(img.dataset.statusId)
    }
    if (event.button == 2)
    {
        if (this.object?.actor.hasCondition(img.dataset.statusId))
        {
            return actor.removeCondition(img.dataset.statusId)
        }
        else 
        {
            return actor.addCondition(img.dataset.statusId, 1, {"flags.core.overlay": true})
        }
    }
    //return this.object.toggleEffect(effect, {overlay});
  }

    activateListeners(html)
    {   
        super.activateListeners(html);
        const effectsTray = html.find(".status-effects");

        effectsTray.off("click", ".effect-control");
        effectsTray.off("contextmenu", ".effect-control");
        
        effectsTray.on("click", ".effect-control", this._onToggleEffect.bind(this));
        effectsTray.on("contextmenu", ".effect-control", event => this._onToggleEffect(event, {overlay: true}));

    }
}