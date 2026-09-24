export function createScripturePreparationShell(
  canManage,
  canCommunicate = canManage
) {

  return `
    <div>
      <h2 style="margin-top:0;">
        Scripture Preparation
      </h2>

      <div
        style="
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:8px;
          margin-bottom:18px;
        "
      >
        ${tabButton('dashboard', 'Dashboard')}
        ${tabButton('prepare', 'Prepare')}
        ${
          canManage
            ? tabButton('admin', 'Admin')
            : ''
        }
        ${
          canCommunicate
            ? tabButton('communication', 'Communication')
            : ''
        }
      </div>

      <div id="scripture-preparation-dashboard"></div>
    </div>
  `
}


function tabButton(
  tab,
  label
) {

  return `
    <button
      type="button"
      data-scripture-preparation-tab="${tab}"
      style="
        padding:10px;
        border:1px solid #dddddd;
        border-radius:8px;
        background:#f7f7f7;
        font-weight:bold;
      "
    >
      ${label}
    </button>
  `
}
