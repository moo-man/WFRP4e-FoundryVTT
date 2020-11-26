export default class WFRPTokenHUD extends TokenHUD {

    // static get defaultOptions() {
    //     return mergeObject(super.defaultOptions, {
    //         template: "systems/wfrp4e/templates/apps/token-hud.html"
    //     }, {overwrite: true})
    // }

    activateListeners(html)
    {



        html.find(".status-effects")
        .off("click", ".effect-control", this._onToggleEffect.bind(this))
        .off("contextmenu", ".effect-control", event => this._onToggleEffect(event, {overlay: true}));
        //.on("click", ".effect-control", this._onToggleEffect.bind(this))
        //.on("contextmenu", ".effect-control", event => this._onToggleEffect(event, {overlay: true}));
    }
}