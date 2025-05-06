import CharGenWfrp4e from "../apps/chargen/char-gen.js";

export default function() {
  Hooks.on("renderActorDirectory", async (app, html) =>
  {
      let button = document.createElement("button");
      button.textContent = game.i18n.localize("BUTTON.CharacterCreation");
      button.classList.add("character-creation");

      button.onclick = () => {CharGenWfrp4e.start();}
      let div = document.createElement("div");
      div.classList.add("action-buttons", "flexrow")
      div.appendChild(button);
      html.querySelector(".header-actions").insertAdjacentElement("afterend", div)
  })
}
