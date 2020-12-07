export default class WFRPTokenHUD extends TokenHUD {


    activateListeners(html)
    {

        html.find(".status-effects")
        .off("click", ".effect-control", this._onToggleEffect.bind(this))
        .off("contextmenu", ".effect-control", event => this._onToggleEffect(event, {overlay: true}));

    }
}