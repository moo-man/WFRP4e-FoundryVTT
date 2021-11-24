export default class BugReportFormWfrp4e extends Application {

    constructor(app) {
        super(app)

        this.endpoint = "https://aa5qja71ih.execute-api.us-east-2.amazonaws.com/Prod/grievance"

        this.domains = [
            "WFRP4e System",
            "WFRP4e Core",
            "Starter Set",
            "Rough Nights & Hard Days",
            "Enemy In Shadows",
            "Ubersreik Adventures I",
            "Death on the Reik",
            "Middenheim: City of the White Wolf",
            "Archives of the Empire: Vol 1.",
            "Power Behind the Throne"
        ]

        this.domainKeys = [
            "wfrp4e",
            "wfrp4e-core",
            "wfrp4e-starter-set",
            "wfrp4e-rnhd",
            "wfrp4e-eis",
            "wfrp4e-ua1",
            "wfrp4e-dotr",
            "wfrp4e-middenheim",
            "wfrp4e-archives1",
            "wfrp4e-pbtt",
        ]

        this.domainKeysToLabel = {
            "wfrp4e" : "system",
            "wfrp4e-core" : "core",
            "wfrp4e-starter-set" : "starter-set",
            "wfrp4e-rnhd" : "rnhd",
            "wfrp4e-eis" : "eis",
            "wfrp4e-ua1" : "ua1",
            "wfrp4e-dotr" : "dotr",
            "wfrp4e-middenheim" : "middenheim",
            "wfrp4e-archives1" : "archives",
            "wfrp4e-pbtt" : "pbtt"
        }
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "bug-report";
        options.template = "systems/wfrp4e/templates/apps/bug-report.html"
        options.classes.push("wfrp4e", "wfrp-bug-report");
        options.resizable = true;
        options.height = 650;
        options.width = 600;
        options.minimizable = true;
        options.title = "Post Your Grievance"
        return options;
    }


    getData() {
        let data = super.getData();
        data.domains = this.domains;
        data.name = game.settings.get("wfrp4e", "bugReportName")
        return data;
    }

    submit(data) {
        fetch(this.endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: data.title,
                body: data.description,
                assignees: ["moo-man"],
                labels : data.labels
            })
        })
        .then(res => {
            if (res.status == 201)
            {
                ui.notifications.notify(game.i18n.localize("ImperialPost"))
                res.json().then(json => {
                    console.log("%c%s%c%s", 'color: gold', `IMPERIAL POST:`, 'color: unset', ` Thank you for your grievance submission. If you wish to monitor or follow up with additional details like screenshots, you can find your issue here: ${json.html_url}`)
                })
            }
            else 
            {
               ui.notifications.error(game.i18n.localize("ImperialPostError"))
               console.error(res)
            }   

        })
        .catch(err => {
            ui.notifications.error(game.i18n.localize("Something went wrong"))
            console.error(err)
        })
    }

    activateListeners(html) {
        html.find(".bug-submit").click(ev => {
            let data = {};
            let form = $(ev.currentTarget).parents(".bug-report")[0];
            data.domain = $(form).find(".domain")[0].value
            data.title = $(form).find(".bug-title")[0].value
            data.description = $(form).find(".bug-description")[0].value
            data.issuer = $(form).find(".issuer")[0].value
            let label = $(form).find(".issue-label")[0].value;


            if (!data.domain || !data.title || !data.description)
                return ui.notifications.error(game.i18n.localize("BugReport.ErrorForm"))
            if (!data.issuer)
                return ui.notifications.error(game.i18n.localize("BugReport.ErrorName1"))

            if (!data.issuer.includes("@") && !data.issuer.includes("#"))
                return ui.notifications.notify(game.i18n.localize("BugReport.ErrorName2"))

            data.title = `[${this.domains[Number(data.domain)]}] ${data.title}`
            data.description = data.description + `<br/>**From**: ${data.issuer}`

            data.labels = [this.domainKeysToLabel[this.domainKeys[Number(data.domain)]]]

            if (label)
                data.labels.push(label);

            game.settings.set("wfrp4e", "bugReportName", data.issuer);

            let wfrp4eModules = Array.from(game.modules).filter(m => this.domainKeys.includes(m[0]))
            
            let versions = `<br/>wfrp4e: ${game.system.data.version}`

            for (let mod of wfrp4eModules)
            {
                let modData = game.modules.get(mod[0]);
                if (modData.active)
                    versions = versions.concat(`<br/>${mod[0]}: ${modData.data.version}`)
            }

            data.description = data.description.concat(versions);

            this.submit(data)
            this.close()
        })
    }
}