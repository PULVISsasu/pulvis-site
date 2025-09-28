import "./style.css";

document.querySelector("#app").innerHTML = `
  <div class="container">
    <header class="nav">
      <a class="logo" href="/">PULVIS</a>
      <nav>
        <a href="#">Machines</a>
        <a href="#">Pour les lieux</a>
        <a href="#">Tarifs</a>
      </nav>
      <a class="btn btn-primary" href="#demo">Demander une démo</a>
    </header>

  <main class="hero">
    <div class="hero-copy">
      <h1>Pulvis — le parfum en libre-service</h1>
      <p>Distributeur connecté pour clubs, hôtels et événements. Paiement sans contact, télémétrie temps réel, maintenance incluse.</p>
      <div class="cta">
        <a class="btn btn-primary" href="#">Je veux une démo</a>
        <a class="btn btn-ghost" href="#">Voir la machine</a>
      </div>
    </div>
    <div class="hero-media"><div class="placeholder">Visuel machine</div></div>
  </main>

  <section id="demo" class="section">
    <h2>Demander une démo</h2>
    <form id="demo-form" class="form" action="https://formspree.io/f/xxxxxxxx" method="POST">
      <div class="grid2">
        <label>Nom*
          <input name="name" required />
        </label>
        <label>Email pro*
          <input type="email" name="email" required />
        </label>
      </div>
      <div class="grid2">
        <label>Type de lieu*
          <select name="venue" required>
            <option value="">Sélectionner…</option>
            <option>Club</option><option>Bar</option><option>Hôtel</option>
            <option>Salle de concert</option><option>Autre</option>
          </select>
        </label>
        <label>Ville
          <input name="city" />
        </label>
      </div>
      <label>Message
        <textarea name="message" rows="4" placeholder="Dites-nous votre contexte (fréquentation, horaires, événements)…"></textarea>
      </label>
      <div class="form-foot">
        <small>En soumettant, vous acceptez notre politique de confidentialité.</small>
        <button class="btn btn-primary" type="submit">Envoyer la demande</button>
      </div>
    </form>
    <p id="demo-ok" class="ok" hidden>Merci ! On revient vers vous très vite.</p>
  </section>
`;
const form = document.getElementById("demo-form");
const okMsg = document.createElement("p");
okMsg.className = "ok";
okMsg.textContent = "Merci ! On revient vers vous très vite.";
okMsg.hidden = true;
form.after(okMsg);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const res = await fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  });
  if (res.ok) {
    form.reset();
    okMsg.hidden = false;
  } else {
    alert("Erreur d’envoi. Réessayez ou contactez-nous.");
  }
});
document.getElementById("y").textContent = new Date().getFullYear();
