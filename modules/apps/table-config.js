

export default class WFRPTableConfig extends RollTableConfig {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {width: 725})
    }

    activateListeners(html) 
    {
        super.activateListeners(html);

        html.prepend($(`<div class="form-group">
            <label>${game.i18n.localize("TABLE.Key")}</label>
            <input type="text" name="flags.wfrp4e.key" value="${this.object.flags.wfrp4e?.key || ""}"/>
            <label>${game.i18n.localize("TABLE.Column")}</label>
            <input type="text" name="flags.wfrp4e.column" value="${this.object.flags.wfrp4e?.column || ""}"/>
        </div>`))
    }
}