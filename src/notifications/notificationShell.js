export function renderNotificationShell() {

  document
    .querySelector('.webview-shell')
    .insertAdjacentHTML(
      'beforeend',
      `
      <!-- NOTIFICATIONS -->
      <div
        id="church-notifications-overlay"
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
            max-width:440px;
            max-height:90vh;
            overflow-y:auto;
            background:#fffdf8;
            border-radius:12px;
            border:1px solid #dddddd;
            padding:22px;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
            color:#202124;
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
              Church Notifications
            </h2>

            <button
              id="close-church-notifications-top-button"
              type="button"
              style="
                padding:7px 10px;
                line-height:1;
                border:1px solid #dddddd;
                border-radius:10px;
                background:#fff8e8;
                color:#202124;
              "
            >
              Close
            </button>
          </div>

          <div
            id="church-notification-admin-area"
          ></div>

          <div
            id="church-notification-content"
          ></div>

          <button
            id="close-church-notifications-button"
            style="
              width:100%;
              padding:11px;
              margin-top:18px;
              border:1px solid #dddddd;
              border-radius:10px;
              background:#fff8e8;
              color:#202124;
              font-weight:700;
            "
          >
            Close
          </button>

        </div>
      </div>


      <!-- NOTIFICATION ADMIN -->
      <div
        id="church-admin-overlay"
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
            max-width:440px;
            max-height:92vh;
            overflow-y:auto;
            background:#fffdf8;
            border-radius:12px;
            border:1px solid #dddddd;
            padding:22px;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
            color:#202124;
          "
        >

          <h2 style="margin-top:0;">
            Create Notification
          </h2>

          <form id="church-notification-form">

            <label>
              <strong>Title</strong>
            </label>

            <input
              id="church-notification-title"
              type="text"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                margin-top:6px;
                margin-bottom:14px;
                font-size:16px;
                border:1px solid #dddddd;
                border-radius:10px;
                background:#ffffff;
              "
            >


            <label>
              <strong>Message</strong>
            </label>

            <textarea
              id="church-notification-message"
              rows="5"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                margin-top:6px;
                margin-bottom:14px;
                font-size:16px;
                border:1px solid #dddddd;
                border-radius:10px;
                background:#ffffff;
              "
            ></textarea>


            <label>
              <strong>
                Open section when tapped
              </strong>
            </label>

            <select
              id="church-notification-section"
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                margin-top:6px;
                margin-bottom:14px;
                font-size:16px;
                border:1px solid #dddddd;
                border-radius:10px;
                background:#ffffff;
              "
            >
              <option value="church">
                Church
              </option>

              <option value="food">
                Food
              </option>

              <option value="choir">
                Choir
              </option>

              <option value="youth">
                Youth
              </option>

              <option value="prayer">
                Prayer
              </option>

              <option value="sunday-school">
                Sunday School
              </option>

              <option value="scripture-preparation">
                Scripture Preparation
              </option>

              <option value="danish-language">
                Language School
              </option>

              <option value="daily-devotion">
                Daily Devotion
              </option>

              <option value="ai-bible-reading">
                Daily Bible Reading
              </option>

              <option value="plan">
                Service Plan
              </option>

              <option value="board">
                Board
              </option>
            </select>


            <label>
              <strong>Send</strong>
            </label>

            <select
              id="church-notification-send-mode"
              style="
                width:100%;
                box-sizing:border-box;
                padding:12px;
                margin-top:6px;
                margin-bottom:14px;
                font-size:16px;
                border:1px solid #dddddd;
                border-radius:10px;
                background:#ffffff;
              "
            >
              <option value="now">
                Send Now
              </option>

              <option value="scheduled">
                Schedule for Later
              </option>
            </select>


            <div
              id="notification-schedule-fields"
              style="display:none;"
            >

              <label>
                <strong>Date</strong>
              </label>

              <input
                id="church-notification-date"
                type="date"
                style="
                  width:100%;
                  box-sizing:border-box;
                  padding:12px;
                  margin-top:6px;
                  margin-bottom:14px;
                  font-size:16px;
                  border:1px solid #dddddd;
                  border-radius:10px;
                  background:#ffffff;
                "
              >


              <label>
                <strong>Time</strong>
              </label>

              <input
                id="church-notification-time"
                type="time"
                style="
                  width:100%;
                  box-sizing:border-box;
                  padding:12px;
                  margin-top:6px;
                  margin-bottom:14px;
                  font-size:16px;
                  border:1px solid #dddddd;
                  border-radius:10px;
                  background:#ffffff;
                "
              >

            </div>


            <div
              id="church-admin-status"
              style="
                margin-bottom:12px;
                font-size:14px;
                line-height:1.4;
              "
            ></div>


            <button
              id="save-church-notification-button"
              type="submit"
              style="
                width:100%;
                padding:13px;
                font-weight:bold;
                font-size:16px;
                margin-bottom:10px;
                border:1px solid #dddddd;
                border-radius:10px;
                background:#fff8e8;
                color:#202124;
              "
            >
              Create Notification
            </button>


            <button
              id="close-church-admin-button"
              type="button"
              style="
                width:100%;
                padding:11px;
                border:1px solid #dddddd;
                border-radius:10px;
                background:#fff8e8;
                color:#202124;
                font-weight:700;
              "
            >
              Cancel
            </button>

          </form>
        </div>
      </div>
      `
    )
}
