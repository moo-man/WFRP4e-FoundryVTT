import html from "../system/utility-wfrp4e";
import ev from "../system/socket-handlers";

export default class ScriptConfig extends FormApplication
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["wfrp4e", "script-config"]);
        options.title = game.i18n.localize("SCRIPT.Config");
        options.resizable = true;
        options.width = 650;
        options.height = 500;
        options.template = "systems/wfrp4e/templates/apps/script-config.hbs";
        return options;
    }

    constructor(...args)
    {
        super(...args);
    }

    async getData() 
    {
        let data = await super.getData();
        this.aceActive = game.modules.get("acelib")?.active;
        data.aceActive = this.aceActive;
        data.script = this._getScript();
        return data;
    }


    _getScript()
    {
        return getProperty(this.object, this.options.path);
    }

    _updateObject(ev, formData)
    {
        let script = this.aceActive ? this.editor.getValue() : formData.script; 
        return this.object.update({[this.options.path] : script});
    }

    _getAceEditorContents()
    {
        return this._getScript() || "";
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        if (this.aceActive)
        {
            this.editor = ace.edit(html.find(".ace-editor")[0]);
            this.editor.setValue(this._getAceEditorContents());
            this.editor.setOptions(mergeObject(ace.userSettings, {
                theme : "ace/theme/solarized_dark",
                keyboardHandler : "ace/mode/vscode",
                printMargin : 0,
                maxLines: 999999,
                indentedSoftWrap: false,
                esVersion: 13,
            }));
            this.editor.session.on('changeMode', function(e, session){
                if ("ace/mode/javascript" === session.getMode().$id) {
                    if (!!session.$worker) {
                        session.$worker.send("setOptions", [{
                            "esversion": 13
                        }]);
                    }
                }
            });
            this.editor.session.setMode("ace/mode/javascript");
            this.editor.session.setUseWrapMode(false);
            this.editor.setAutoScrollEditorIntoView(true);
            this.editor.clearSelection();
        }

        // Prevent tab from changing focus, instead add a tab to the textarea
        html.find("textarea.no-ace").keydown(ev => 
        {
            if (ev.key == "Tab")
            {
                ev.preventDefault();
                let target = ev.target;
                var start = target.selectionStart;
                var end = target.selectionEnd;

                target.value = target.value.substring(0, start) + "\t" + target.value.substring(end);

                target.selectionStart = target.selectionEnd = start + 1;
            }
        });
    }

    setPosition({left, top, width, height, scale} = {}) {
        if (this.aceActive)
            this.editor.resize();

        return super.setPosition({left, top, width, height, scale});
    }
}