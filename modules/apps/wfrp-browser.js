
export default class BrowserWfrp4e extends warhammer.apps.CompendiumBrowser {
  constructor(...args) {
    super(...args)

    const msg = "BrowserWfrp4e has been removed in favor of the Compendium Browser. Please use `warhammer.apps.CompendiumBrowser.render(true);` instead.";
    ui.notifications.warn(msg, {permanent: true});
  }

}
