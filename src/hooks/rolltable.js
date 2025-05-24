export default function() {
    Hooks.on("preCreateTableResult", (result, data) => {
        if (!data.img)
            result.updateSource({"img" : "icons/svg/d10-grey.svg"})
    })

    Hooks.on("preCreateRollTable", (table, data) => {
        if (!data.img)
            table.updateSource({"img" : "systems/wfrp4e/ui/buttons/d10.webp"})
    })

    Hooks.on("getHeaderControlsRollTableSheet", (sheet, controls) => {
        controls.push({
            label : "Configure Table Key",
            icon : "fa-solid fa-key",
            action : "configureKey" 
        });
        sheet.options.actions.configureKey = function (ev, target){
            let key = this.document.getFlag("wfrp4e", "key");
            let column = this.document.getFlag("wfrp4e", "column");

            new foundry.applications.api.DialogV2({
              window: { title: "Table Key & Column" },
              content: `
              <div class="form-group">
                <label>Key</label>
              <div class="form-fields">
              <input type="text" value="${key}" name="key"/>
              </div>
              </div>

              <div class="form-group">
                <label>Column</label>
              <div class="form-fields">
              <input type="text" value="${column}" name="column"/>
              </div>
              </div>
              `,
              buttons: [{
                action: "submit",
                label: "Submit",
                default: true,
                callback: (event, button, dialog) => {
                    let key = button.form.elements.key.value;
                    let column = button.form.elements.column.value;

                    this.document.update({"flags.wfrp4e" : {key, column}})
                }
              }],
            }).render({ force: true });
        }
        sheet.options.actions.configureKey = sheet.options.actions.configureKey.bind(sheet);
    })
}