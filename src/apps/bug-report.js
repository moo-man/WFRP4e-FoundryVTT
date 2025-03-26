import WFRP_Utility from "../system/utility-wfrp4e";

export default class BugReportFormWfrp4e extends Application {

    
    static issues = []; // Keep issues in static to avoid API limit
    static apiLimitReached = false;

    constructor(app) {
        super(app)

        this.endpoint = "https://aa5qja71ih.execute-api.us-east-2.amazonaws.com/Prod/grievance"
        this.github = "https://api.github.com/repos/moo-man/WFRP4e-FoundryVTT/"

        this.domainKeysToLabel = {
            "wfrp4e": "system",
            "wfrp4e-core": "core",
            "wfrp4e-starter-set": "starter-set",
            "wfrp4e-rnhd": "rnhd",
            "wfrp4e-eis": "eis",
            "wfrp4e-ua1": "ua1",
            "wfrp4e-dotr": "dotr",
            "wfrp4e-middenheim": "middenheim",
            "wfrp4e-archives1": "archives1",
            "wfrp4e-pbtt": "pbtt",
            "wfrp4e-altdorf": "altdorf",
            "wfrp4e-ua2": "ua2",
            "wfrp4e-owb1": "owb1",
            "wfrp4e-horned-rat": "horned-rat",
            "wfrp4e-empire-ruins": "empire-ruins",
            "wfrp4e-archives2" : "archives2",
            "wfrp4e-up-in-arms" : "up-in-arms",
            "wfrp4e-wom" : "wom",
            "wfrp4e-zoo" : "zoo",
            "wfrp4e-salzenmund" : "salzenmund",
            "wfrp4e-owb2" : "owb2",
            "wfrp4e-soc" : "soc",
        }

        this.loadingIssues = this.loadIssues();
        this.latest = this.checkVersions();
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "bug-report";
        options.template = "systems/wfrp4e/templates/apps/bug-report.hbs"
        options.classes.push("wfrp4e", "wfrp-bug-report");
        options.resizable = true;
        options.width = 600;
        options.minimizable = true;
        options.title = "Enter Your Grudge"
        options.tabs = [{ navSelector: ".tabs", contentSelector: ".content", initial: "submit" }]
        return options;
    }


    async _render(...args)
    {
        await super._render(...args)
        this.latest = await this.latest;
        this.element.find(".module-check").replaceWith(this.formatVersionWarnings())
    }

    async getData() {
        let data = await super.getData();
        await this.loadingIssues;
        data.domains = game.wfrp4e.config.premiumModules;
        data.name = game.settings.get("wfrp4e", "bugReportName")
        data.record = await this.buildRecord()
        if (this.constructor.apiLimitReached)
        {
            ui.notifications.error(game.i18n.localize("BUGREPORT.ApiLimitReached"), {permanent : true})
        }
        return data;
    }

    formatVersionWarnings() {

        if (!this.latest || this.latest instanceof Promise)
        {
            return "<div></div>"
        }


        let allUpdated = true;
        let outdatedList = ""

        for (let key in this.latest) {
            if (!this.latest[key]) {
                allUpdated = false;
                outdatedList += `<li>${game.wfrp4e.config.premiumModules[key]}</li>`;
            }
        }

        let element = `<div class='notification ${allUpdated ? "stable" : "warning"}'>`

        if (allUpdated) {
            element += game.i18n.localize("BUGREPORT.Updated")
        }
        else {
            element += game.i18n.localize("BUGREPORT.NotUpdated")
            element += "<ul>"
            element += outdatedList
            element += "</ul>"
        }

        element += "</div>"

        return element;
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
                labels: data.labels
            })
        })
            .then(res => {
                if (res.status == 201) {
                    ui.notifications.notify(game.i18n.localize("GrudgePost"))
                    res.json().then(json => {
                        console.log("%c%s%c%s", 'color: lightblue', `DAMMAZ KRON:`, 'color: unset', ` The longbeards hear you, thank you for your submission into the Dammaz Kron, these wrongs must be righted! If you wish to monitor or follow up with additional details like screenshots, you can find your issue here: ${json.html_url}.`)
                        this.recordIssue(json.number)
                    })
                }
                else {
                    ui.notifications.error(game.i18n.localize("GrudgePostError"))
                    console.error(res)
                }

            })
            .catch(err => {
                ui.notifications.error(game.i18n.localize("Something went wrong"))
                console.error(err)
            })
    }

    recordIssue(number)
    {
        let grudges = foundry.utils.deepClone(game.settings.get("wfrp4e", "grudges"));
        grudges.push(number)
        game.settings.set("wfrp4e", "grudges", grudges).then(() => {
            this.refreshIssues();
        });
    }


    async loadIssues() {
        warhammer.utility.log("Loading GitHub Issues...")
        if (this.constructor.issues.length == 0)
        {

            for(let i = 1; i <= 10; i++)
            {
                SceneNavigation.displayProgressBar({label: game.i18n.localize("BUGREPORT.LoadingIssues"), pct: Math.round((i / 10) * 100) })

                this.constructor.issues = this.constructor.issues.concat((await fetch(this.github + `issues?per_page=100&page=${i}&state=all`)
                .then(r => r.json())
                .catch(error => {
                    if (error.status == 403)
                    {
                        this.constructor.apiLimitReached = true;
                    }
                    console.error(error)
                    this.constructor.issues = [];
                    return [];
                    
                })).map(this.trimIssue))
            }
        }
        else 
        {
            warhammer.utility.log("Skipping requests, issues already loaded");
        }
        warhammer.utility.log("Issues: ", undefined, this.constructor.issues)
        return this.constructor.issues;
    }

    // Issues are big objects, no need to keep everything, so just take what's needed
    trimIssue(issue)
    {
        return {
            number: issue.number,
            title : issue.title,
            html_url : issue.html_url,
            labels : issue.labels,
            state : issue.state
        }
    }

    async refreshIssues()
    {
        // Request a new page of issues, only keep issues we don't have
        let newIssues = (await fetch(this.github + `issues?per_page=100&state=all`).then(r => r.json()).catch(error => console.error(error))).map(this.trimIssue);
        this.constructor.issues = this.constructor.issues.concat(newIssues.filter(newIssue => !this.constructor.issues.find(i => i.number == newIssue.number)))
    }

    async buildRecord()
    {
        let numbersSubmitted = game.settings.get("wfrp4e", "grudges");

        let issuesSubmitted = this.constructor.issues.filter(i => numbersSubmitted.includes(i.number));

        let record = {
            open : issuesSubmitted.filter(i => i.state == "open"),
            closed : issuesSubmitted.filter(i => i.state == "closed"),
            alert : false
        }

        for(let issue of record.open)
        {
            if (issue.labels.find(l => l.name == "non-repro" || l.name == "needs-info"))
            {
                issue.alert = true;
                record.alert = true;
            }
        }

        return record
    }

    async checkVersions() {
        let latest = {}
        warhammer.utility.log("Checking Version Numbers...")
        for (let key in game.wfrp4e.config.premiumModules) {
            if (key == game.system.id) {
                // Have to use release tag instead of manifest version because CORS doesn't allow downloading release asset for some reason
                let release = await fetch(this.github + "releases/latest").then(r => r.json()).catch(e => {
                    console.error("Could not fetch latest versions: " + e)
                    return latest;
                })
                latest[key] = !foundry.utils.isNewerVersion(release.tag_name, game.system.version)
            }
            else if (game.modules.get(key)) {
                let manifest = await fetch(`https://foundry-c7-manifests.s3.us-east-2.amazonaws.com/${key}/module.json`).then(r => r.json()).catch(e => {
                    console.error("Could not fetch latest versions: " + e)
                    return latest;
                });
                latest[key] = !foundry.utils.isNewerVersion(manifest.version, game.modules.get(key).version)
            }
            warhammer.utility.log(key + ": " + latest[key])
        }
        warhammer.utility.log("Version Status:", undefined, latest);
        return latest;
    }

    matchIssues(text) {

        let issues = this.constructor.issues.filter(i => i.state == "open");

        let words = text.toLowerCase().split(" ");
        let percentages = new Array(issues.length).fill(0)


        issues.forEach((issue, issueIndex) => {
            let issueWords = (issue.title + " " + issue.body).toLowerCase().trim().split(" ");
            words.forEach((word) => {
                {
                    if (issueWords.includes(word))
                        percentages[issueIndex]++
                }
            })
        })
        let matchingIssues = [];
        percentages = percentages.map(i => i/issues.length)
        percentages.forEach((p, i) => {
            if (p > 0)
                matchingIssues.push(issues[i])
        })
        return matchingIssues;
    }

    showMatchingGrudges(element, issues)
    {
        if(!issues || issues?.length <= 0)
            element[0].style.display="none"
        else 
        {
            element[0].style.display="flex";
            let list = element.find(".grudge-list");
            list.children().remove();
            list.append(issues.map(i => `<div class="grudge"><a href="${i.html_url}">${i.title}</div>`))
        }
    }

    checkWarnings(text)
    {
        let publicityWarning = this.element.find(".publicity")[0];
        let discordNameWarning = this.element.find(".discord")[0];
        publicityWarning.style.display = text.includes("@") ? "block" : "none"
        discordNameWarning.style.display = text.includes("#") ? "block" : "none"
    }

    activateListeners(html) {


        let modulesWarning = html.find(".active-modules")[0];
        let title = html.find(".bug-title")[0];
        let description = html.find(".bug-description")[0];
        let matching = html.find(".matching");
        let issuer = html.find(".issuer")[0]

        this.checkWarnings(issuer.value)

        html.find(".issuer").keyup(ev => {
            this.checkWarnings(ev.target.value)
        })

        html.find(".issue-label").change(ev => {
            if (ev.currentTarget.value == "bug") {
                if (game.modules.contents.filter(i => i.active).map(i => i.id).filter(i => !game.wfrp4e.config.premiumModules[i]).length > 0)
                    modulesWarning.style.display = "block"
                else
                    modulesWarning.style.display = "none"
            }
            else
                modulesWarning.style.display = "none"
        })

        html.find(".bug-title, .bug-description").keyup(async ev => {
            let text = title.value + " " + description.value
            text = text.trim();
            if (text.length > 2) {
                this.showMatchingGrudges(matching, this.matchIssues(text));
            }
        })

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


            data.title = `[${game.wfrp4e.config.premiumModules[data.domain]}] ${data.title}`
            data.description = data.description + `<br/>**From**: ${data.issuer}`

            data.labels = [this.domainKeysToLabel[data.domain]]

            if (label)
                data.labels.push(label);

            game.settings.set("wfrp4e", "bugReportName", data.issuer);

            let wfrp4eModules = Array.from(game.modules).filter(m => game.wfrp4e.config.premiumModules[m.id])

            let versions = `<br/>foundry: ${game.version}<br/>wfrp4e: ${game.system.version}`

            for (let mod of wfrp4eModules) {
                let modData = game.modules.get(mod.id);
                if (modData.active)
                    versions = versions.concat(`<br/>${mod.id}: ${modData.version}`)
            }

            data.description = data.description.concat(versions);
            data.description += `<br/>Active Modules: ${game.modules.contents.filter(i => i.active).map(i => i.id).filter(i => !game.wfrp4e.config.premiumModules[i]).join(", ")}`

            this.submit(data)
            this.close()
        })
    }
}
