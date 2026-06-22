/* ===========================================================
   Shared nav + footer + SVG defs for Annote landing pages.
   Each page calls: <body data-page="pricing"> and includes this.
   =========================================================== */

(function(){
  const page = document.body.dataset.page || '';

  // SVG defs (logo + cursor)
  const defs = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <linearGradient id="lg-top" x1="1.5" y1="13.83" x2="32.72" y2="31.74" gradientUnits="userSpaceOnUse">
      <stop stop-color="#974B89"/><stop offset="1" stop-color="#5148C7"/>
    </linearGradient>
    <linearGradient id="lg-bot" x1="0" y1="54.86" x2="32.35" y2="73.42" gradientUnits="userSpaceOnUse">
      <stop stop-color="#573372"/><stop offset="1" stop-color="#FD0C63"/>
    </linearGradient>
    <symbol id="annote-mark" viewBox="0 0 44 55">
      <path fill="url(#lg-top)" d="M43.0959 11.4316C41.0954 11.3859 36.1417 11.0038 31.2531 7.59108C28.4558 5.62764 26.1671 3.02527 24.5772 0H14.9759V9.25937C14.851 9.45229 14.6914 9.62036 14.5051 9.75501C14.4568 9.74508 14.4077 9.73997 14.3584 9.73978H0V24.8306H15.0908V11.9771C15.4507 11.6814 15.891 11.5001 16.3548 11.4565C19.6775 16.0751 23.1761 18.5533 25.4923 19.8908C33.0986 24.2809 43.0627 25.0798 43.0959 24.9455C43.0779 24.8015 43.0752 20.8834 43.0959 11.4316Z"/>
      <path fill="url(#lg-bot)" d="M0 43.4318C2.00058 43.4775 6.95421 43.8596 11.8428 47.2723C14.6401 49.2358 16.9288 51.8382 18.5187 54.8634H28.12V45.604C28.2449 45.4112 28.4045 45.2431 28.5908 45.1084C28.6391 45.1184 28.6882 45.1235 28.7375 45.1236H43.0959V30.0328H28.0051V42.8863C27.6452 43.182 27.2049 43.3634 26.7411 43.4069C23.4184 38.7883 19.9198 36.31 17.6036 34.9726C9.99729 30.5825 0.0332261 29.7836 0 29.9179C0.0179988 30.0619 0.0207666 33.98 0 43.4318Z"/>
    </symbol>
    <symbol id="cursor" viewBox="0 0 22 24">
      <path d="M2 1.6 18.6 12.3 10.7 13.6 6.9 21z" fill="#1A1424" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
    </symbol>
  </defs>
</svg>`;

  const navLinks = [
    { href: '/use-cases/qa-testing', label: 'Use cases', match: ['use-cases'] },
    { href: '/use-cases/agencies', label: 'Agencies', match: ['agencies'] },
    { href: '/use-cases/teams', label: 'Teams', match: ['teams'] },
    { href: '/#pricing', label: 'Pricing', match: ['pricing'] },
    { href: '/docs', label: 'Docs', match: ['docs'] }
  ];

  const navHTML = `
<nav class="nav">
  <div class="wrap nav-inner">
    <a href="/" class="brand">
      <span class="mark"><svg viewBox="0 0 44 55" width="100%" height="100%"><use href="#annote-mark"/></svg></span>
      Annote
    </a>
    <div class="nav-links">
      ${navLinks.map((l,i)=>`<a href="${l.href}" class="${l.match.includes(page)?'active':''}" data-key="${i}">${l.label}</a>`).join('')}
    </div>
    <div class="nav-cta">
      <a href="/#contact" class="btn btn-ghost">Contact sales</a>
      <a href="/login" class="btn btn-ghost">Sign in</a>
      <a href="/signup" class="btn btn-primary">Get Annote <span class="arr">→</span></a>
    </div>
  </div>
</nav>`;

  const footerHTML = `
<footer>
  <div class="wrap">
    <div class="f-grid">
      <div class="f-brand">
        <a href="../Annote Landing v3.html" class="brand">
          <span class="mark"><svg viewBox="0 0 44 55" width="100%" height="100%"><use href="#annote-mark"/></svg></span>
          Annote
        </a>
        <p>Feedback at the speed of seeing it. Made for people who care about the details.</p>
      </div>
      <div class="f-col">
        <h5>Use cases</h5>
        <ul>
          <li><a href="/use-cases/qa-testing">QA testing</a></li>
          <li><a href="/use-cases/design-review">Design review</a></li>
          <li><a href="/use-cases/client-feedback">Client feedback</a></li>
        </ul>
      </div>
      <div class="f-col">
        <h5>Solutions</h5>
        <ul>
          <li><a href="/use-cases/agencies">Agencies</a></li>
          <li><a href="/use-cases/teams">Teams</a></li>
          <li><a href="/docs">Help center</a></li>
        </ul>
      </div>
      <div class="f-col">
        <h5>Legal</h5>
        <ul>
          <li><a href="terms.html">Terms</a></li>
          <li><a href="privacy.html">Privacy policy</a></li>
          <li><a href="trust.html">Trust</a></li>
        </ul>
      </div>
      <div class="f-col">
        <h5>Connect</h5>
        <ul>
          <li><a href="https://www.linkedin.com/company/annoteai">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <div class="f-bottom">
      <div class="left">
        <span>© Annote · Made for people who care about the details.</span>
      </div>
      <div class="right">
        <span class="stat"><span class="pip"></span>All systems normal</span>
        <a href="https://www.linkedin.com/company/annoteai">LinkedIn</a>
      </div>
    </div>
  </div>
</footer>`;

  // Inject in order
  document.body.insertAdjacentHTML('afterbegin', defs + navHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
