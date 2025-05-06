import GenericActions from "../system/actions";

export default class ChatMessageWFRP extends WarhammerChatMessage 
{

    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);
        this.updateSource({"content" : this.constructor.addEffectButtons(data.content)})
    }

    async _onCreate(document, options, user)
    {
        await super._onCreate(document, options, user);
        let test = document.system.test;
        if (test)
        {
          test.postTestGM(document)
        }
    }

    /** @inheritDoc */
    async renderHTML(options)
    {
        let html = await super.renderHTML(options);
        if (this.getFlag("wfrp4e", "socketResult"))
        {
          html.classList.add("socket-result");
          html.style.display = "none";
        }
        GenericActions.addEventListeners(html, this);
        return html;
    }

    
  // If content includes "@Condition[...]" add a button to apply that effect
  // Optionally provide a set of conditions
  static addEffectButtons(content, conditions = [])
  {
    content = content?.toString()
    // Don't add buttons if already added, or from posted items
    if (content?.includes("apply-conditions") || content?.includes("post-item"))
    {
      return content;
    }

    let regex = /@Condition\[(.+?)\]/gm

    let matches = Array.from(content.matchAll(regex));

    conditions = conditions.concat(matches.map(m => m[1].toLowerCase())).filter(i => game.wfrp4e.config.conditions[i])

    // Dedup
    conditions = conditions.filter((c, i) => conditions.indexOf(c) == i)

    if (conditions.length)
    {
      let html = `<div class="apply-conditions">`
      conditions.forEach(c => 
          html += `<a class="chat-button apply-condition" data-cond="${c}">${game.i18n.format("CHAT.ApplyCondition", {condition: game.wfrp4e.config.conditions[c]})}</a>`
      )

      html += `</div>`
      content += html;
    }
    return content
  }
}