export function renderAppShell() {

  document.querySelector('#app').innerHTML = `
    <div class="webview-shell">

      <iframe
        id="church-site"
        src="https://www.emdrupkirke.dk/urdu"
        title="One in Christ Church"
        allow="clipboard-read; clipboard-write"
      ></iframe>


      <!-- Existing actions are triggered by the app-only TYPO3 menu links. -->
      <div hidden>
      <!-- MEMBER LOGIN BUTTON -->
      <button
        id="member-login-button"
        style="
          position:fixed;
          right:15px;
          bottom:15px;
          z-index:99998;
          padding:10px 14px;
          border:none;
          border-radius:8px;
          background:white;
          box-shadow:0 2px 12px rgba(0,0,0,.25);
          font-size:14px;
        "
      >
        Member Login
      </button>


      <!-- MEMBER AREA BUTTON -->
      <button
        id="member-area-button"
        style="
          display:none;
          position:fixed;
          left:15px;
          bottom:15px;
          z-index:99998;
          padding:10px 14px;
          border:none;
          border-radius:8px;
          background:white;
          box-shadow:0 2px 12px rgba(0,0,0,.25);
          font-size:14px;
        "
      >
        Member Area
      </button>
      </div>


      <!-- LOGIN OVERLAY -->
      <div
        id="member-login-overlay"
        style="
          display:none;
          position:fixed;
          inset:0;
          z-index:99999;
          background:rgba(0,0,0,.55);
          align-items:center;
          justify-content:center;
          padding:20px;
          box-sizing:border-box;
        "
      >

        <div
          style="
            width:100%;
            max-width:380px;
            background:white;
            border-radius:12px;
            padding:22px;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
          "
        >

          <h2 style="margin-top:0;">
            Member Login
          </h2>

          <input
            id="member-email"
            type="email"
            placeholder="Email address"
            style="
              width:100%;
              padding:12px;
              box-sizing:border-box;
              margin-bottom:12px;
              font-size:16px;
            "
          >

          <input
            id="member-phone"
            type="tel"
            placeholder="Telephone number"
            style="
              width:100%;
              padding:12px;
              box-sizing:border-box;
              margin-bottom:12px;
              font-size:16px;
            "
          >

          <input
            id="member-password"
            type="password"
            placeholder="Password"
            style="
              width:100%;
              padding:12px;
              box-sizing:border-box;
              margin-bottom:12px;
              font-size:16px;
            "
          >

          <button
            id="sign-in-button"
            style="
              width:100%;
              padding:12px;
              margin-bottom:10px;
            "
          >
            Sign In
          </button>

          <button
            id="create-account-button"
            style="
              width:100%;
              padding:12px;
            "
          >
            Create Account
          </button>

          <div
            style="
              display:flex;
              align-items:center;
              gap:10px;
              margin:16px 0;
              color:#777;
              font-size:13px;
            "
          >
            <span style="flex:1;height:1px;background:#ddd;"></span>
            or
            <span style="flex:1;height:1px;background:#ddd;"></span>
          </div>

          <button
            id="guest-login-button"
            type="button"
            style="
              width:100%;
              padding:12px;
              border:1px solid #2f5ea8;
              border-radius:7px;
              background:#eef4ff;
              color:#173b73;
              font-size:16px;
              font-weight:bold;
            "
          >
            Continue as Guest
          </button>

          <p
            style="
              margin:8px 0 0;
              color:#666;
              font-size:12px;
              line-height:1.4;
              text-align:center;
            "
          >
            Guest access is limited to the Service Plan.
          </p>

          <button
            id="guest-logout-button"
            type="button"
            style="
              display:none;
              width:100%;
              padding:11px;
              margin-top:14px;
              border:1px solid #b94a48;
              border-radius:7px;
              background:#fff4f4;
              color:#8a2424;
              font-weight:bold;
            "
          >
            Logout Guest
          </button>

          <div
            id="login-status"
            style="
              margin-top:15px;
              font-size:14px;
              line-height:1.5;
            "
          ></div>

          <button
            id="sign-out-button"
            style="
              display:none;
              width:100%;
              padding:10px;
              margin-top:15px;
            "
          >
            Sign Out
          </button>

          <button
            id="close-login-button"
            style="
              width:100%;
              padding:10px;
              margin-top:12px;
            "
          >
            Close
          </button>

        </div>
      </div>


      <!-- MEMBER AREA -->
      <div
        id="member-area-overlay"
        style="
          display:none;
          position:fixed;
          inset:0;
          z-index:99999;
          background:rgba(0,0,0,.55);
          align-items:center;
          justify-content:center;
          padding:20px;
          box-sizing:border-box;
        "
      >

        <div
          style="
            width:100%;
            max-width:380px;
            max-height:calc(100vh - 40px);
            overflow-y:auto;
            background:#fffdf8;
            border-radius:12px;
            padding:22px;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:12px;
              margin-bottom:14px;
            "
          >
            <h2 style="margin:0;">
              Member Area
            </h2>

            <button
              id="close-member-area-top-button"
              type="button"
              style="
                padding:7px 10px;
                line-height:1;
              "
            >
              Close
            </button>
          </div>

          <div
            id="member-welcome"
            style="margin-bottom:18px;"
          ></div>

          <div
            id="member-sections"
            style="
              display:flex;
              flex-direction:column;
              gap:10px;
            "
          ></div>

          <button
            id="close-member-area-button"
            style="
              width:100%;
              padding:10px;
              margin-top:18px;
            "
          >
            Close
          </button>

        </div>
      </div>


      <!-- FOOD -->
      <div
        id="food-overlay"
        style="
          display:none;
          position:fixed;
          inset:0;
          z-index:100000;
          background:rgba(0,0,0,.55);
          align-items:center;
          justify-content:center;
          padding:20px;
          box-sizing:border-box;
        "
      >

        <div
          style="
            width:100%;
            max-width:420px;
            max-height:90vh;
            overflow-y:auto;
            background:#fffdf8;
            border-radius:12px;
            padding:22px;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:12px;
              margin-bottom:14px;
            "
          >
            <h2 style="margin:0;">
              Food
            </h2>

            <button
              id="close-food-top-button"
              type="button"
              style="
                padding:7px 10px;
                line-height:1;
              "
            >
              Close
            </button>
          </div>

          <div id="food-admin-area"></div>

          <div id="food-content">
            Loading...
          </div>

          <button
            id="close-food-button"
            style="
              width:100%;
              padding:10px;
              margin-top:18px;
            "
          >
            Close
          </button>

        </div>
      </div>


      <!-- FOOD ADMIN FORM -->
      <div
        id="food-admin-overlay"
        style="
          display:none;
          position:fixed;
          inset:0;
          z-index:100001;
          background:rgba(0,0,0,.55);
          align-items:center;
          justify-content:center;
          padding:20px;
          box-sizing:border-box;
        "
      >

        <div
          style="
            width:100%;
            max-width:430px;
            max-height:92vh;
            overflow-y:auto;
            background:white;
            border-radius:12px;
            padding:22px;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
          "
        >

          <h2
            id="food-admin-heading"
            style="margin-top:0;"
          >
            Food Admin
          </h2>

          <form id="food-admin-form">

            <label>
              <strong>Dinner title</strong>
            </label>

            <input
              id="admin-food-title"
              type="text"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                font-size:16px;
                margin-top:6px;
                margin-bottom:14px;
              "
            >


            <label>
              <strong>Date</strong>
            </label>

            <input
              id="admin-food-date"
              type="date"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                font-size:16px;
                margin-top:6px;
                margin-bottom:14px;
              "
            >


            <label>
              <strong>Time</strong>
            </label>

            <input
              id="admin-food-time"
              type="time"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                font-size:16px;
                margin-top:6px;
                margin-bottom:14px;
              "
            >


            <label>
              <strong>Price in kr.</strong>
            </label>

            <input
              id="admin-food-price"
              type="number"
              min="0"
              step="1"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                font-size:16px;
                margin-top:6px;
                margin-bottom:14px;
              "
            >


            <label>
              <strong>
                Registration deadline
              </strong>
            </label>

            <input
              id="admin-food-deadline"
              type="date"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                font-size:16px;
                margin-top:6px;
                margin-bottom:14px;
              "
            >


            <label>
              <strong>
                Extra information
              </strong>
            </label>

            <textarea
              id="admin-food-info"
              rows="4"
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                font-size:16px;
                margin-top:6px;
                margin-bottom:16px;
                resize:vertical;
              "
            ></textarea>


            <label>
              <strong>
                MobilePay payment link
              </strong>
            </label>

            <input
              id="admin-food-mobilepay-link"
              type="url"
              placeholder="https://..."
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                font-size:16px;
                margin-top:6px;
                margin-bottom:6px;
              "
            >

            <p
              style="
                margin:0 0 14px;
                font-size:12px;
                line-height:1.45;
                color:#666;
              "
            >
              Add the MobilePay Box/payment link if members should be able to choose <strong>Yes, Pay Now</strong>. If this is left empty, Pay Now will be unavailable and members can choose Pay Later.
            </p>


            <div
              style="
                border:1px solid #eadcaa;
                border-radius:10px;
                padding:12px;
                margin-bottom:16px;
                background:#fff8df;
              "
            >
              <strong>
                Voice food message
              </strong>

              <p
                id="food-voice-status"
                style="
                  margin:8px 0;
                  font-size:14px;
                "
              >
                No voice message recorded.
              </p>

              <div id="food-voice-preview"></div>

              <div
                id="food-voice-recording-indicator"
                style="
                  display:none;
                  align-items:center;
                  gap:10px;
                  margin-top:10px;
                  padding:10px;
                  background:#fff1f1;
                  border:1px solid #e7b3b3;
                  border-radius:8px;
                  color:#8b1e1e;
                  font-weight:bold;
                "
              >
                <span
                  style="
                    width:12px;
                    height:12px;
                    border-radius:50%;
                    background:#d21f1f;
                    box-shadow:0 0 0 6px rgba(210,31,31,.18);
                    animation:foodRecordingPulse 1s infinite;
                  "
                ></span>

                Recording food message...
              </div>

              <button
                id="record-food-voice-button"
                type="button"
                style="
                  width:100%;
                  padding:11px;
                  margin-top:10px;
                "
              >
                Record Food Message
              </button>

              <button
                id="stop-food-voice-button"
                type="button"
                disabled
                style="
                  width:100%;
                  padding:11px;
                  margin-top:8px;
                "
              >
                Stop Recording
              </button>

              <button
                id="remove-food-voice-button"
                type="button"
                disabled
                style="
                  width:100%;
                  padding:11px;
                  margin-top:8px;
                "
              >
                Remove Voice Message
              </button>
            </div>


            <label
              style="
                display:flex;
                align-items:center;
                gap:10px;
                margin-bottom:18px;
              "
            >
              <input
                id="admin-food-active"
                type="checkbox"
                style="
                  width:22px;
                  height:22px;
                "
              >

              <strong>Dinner active</strong>
            </label>


            <div
              id="food-admin-status"
              style="
                margin-bottom:12px;
                font-size:14px;
              "
            ></div>


            <button
              id="save-food-admin-button"
              type="submit"
              style="
                width:100%;
                padding:13px;
                font-size:16px;
                font-weight:bold;
                margin-bottom:10px;
              "
            >
              Save Changes
            </button>

            <button
              id="close-food-admin-button"
              type="button"
              style="
                width:100%;
                padding:11px;
              "
            >
              Cancel
            </button>

          </form>

        </div>
      </div>

    </div>
  `
}
