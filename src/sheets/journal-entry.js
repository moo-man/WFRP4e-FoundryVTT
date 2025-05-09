import GenericActions from "../system/actions.js";

export default class JournalEntrySheetWFRP4e extends foundry.applications.sheets.journal.JournalEntrySheet {
  /** @inheritDoc */
  _attachFrameListeners() {
    super._attachFrameListeners();
    GenericActions.addEventListeners(this.element, this);
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);

    let theme = game.settings.get("wfrp4e", "theme")
    if (!theme.journal.enabled)
    {
      this.element.classList.add("no-theme");
      this.element.classList.remove("classic-font");
    }
    else
    {
      this.element.classList.remove("no-theme");

      if (theme.journal.font == "classic")
      {
        this.element.classList.add("classic-font");
      }
      else
      {
        this.element.classList.remove("classic-font");
      }
    }
  }
}