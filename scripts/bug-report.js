class BugReportFormWfrp4e extends Application
{

  constructor(app) {
      super(app)

      this.endpoint = "http://localhost:3000/grievance"

      this.domains = [
          "WFRP4e System",
          "WFRP4e Content"
      ]
  }

  static get defaultOptions()
  {
    const options = super.defaultOptions;
    options.id = "bug-report";
    options.template = "systems/wfrp4e/templates/apps/bug-report.html"
    options.classes.push("wfrp4e", "wfrp-bug-report");
    options.resizable = true;
    options.height = 600;
    options.width = 600;
    options.minimizable = true;
    options.title = "WFRP4e Bug Report"
    return options;
  }


  getData()
  {
      let data = super.getData();
      data.domains = this.domains;
      return data;
  }

  submit(data)
  {
    fetch(this.endpoint, {
        method: "POST",
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify({
            title : data.title,
            body : data.description,
            labels : ["bug"]
        })
    }).then(res => console.log(res))
        .catch(err => {
            ui.notifications.error("Something went wrong.")
            console.log(err)
    })
  }

  activateListeners(html)
  {
      html.find(".bug-submit").click(ev => {
        console.log(ev)
        let data = {};
        let form = $(ev.currentTarget).parents(".bug-report")[0];
        data.domain = $(form).find(".domain")[0].value
        data.title = $(form).find(".bug-title")[0].value
        data.description = $(form).find(".bug-description")[0].value
        data.issuer = $(form).find(".issuer")[0].value

        data.title = `[${this.domains[Number(data.domain)]}] ${data.title}`
        data.description = data.description + ` From: ${data.issuer}`

        if (!data.domain || !data.title || !data.description)
            return ui.notifications.notify("Please fill out the form")
        else 
            ui.notifications.notify("Thank you!")
        this.submit(data)
        this.close()
      })
  }
}