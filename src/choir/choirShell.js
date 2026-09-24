export function renderChoirShell() {

  if (
    document.querySelector(
      '#choir-overlay'
    )
  ) {
    return
  }


  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <div
        id="choir-overlay"
        style="
          display:none;
          position:fixed;
          inset:0;
          z-index:50000;
          background:#fffdf8;
          overflow-y:auto;
        "
      >

        <div
          style="
            max-width:700px;
            margin:0 auto;
            padding:18px;
            box-sizing:border-box;
          "
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:12px;
              margin-bottom:20px;
            "
          >

            <h2
              style="margin:0;"
            >
              Choir
            </h2>

            <button
              id="close-choir-button"
              type="button"
              style="
                padding:8px 14px;
              "
            >
              Close
            </button>

          </div>


          <div
            id="choir-admin-area"
          ></div>


          <div
            id="choir-content"
          >
            Loading...
          </div>

        </div>

      </div>


      <div
        id="choir-admin-overlay"
        style="
          display:none;
          position:fixed;
          inset:0;
          z-index:51000;
          background:#fffdf8;
          overflow-y:auto;
        "
      >

        <div
          style="
            max-width:700px;
            margin:0 auto;
            padding:18px;
            box-sizing:border-box;
          "
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:12px;
              margin-bottom:20px;
            "
          >

            <h2
              id="choir-admin-heading"
              style="margin:0;"
            >
              Create Sunday Choir Plan
            </h2>

            <button
              id="close-choir-admin-button"
              type="button"
            >
              Close
            </button>

          </div>


          <form
            id="choir-plan-form"
          >

            <label>
              <strong>
                Service title
              </strong>
            </label>

            <input
              id="choir-plan-title"
              type="text"
              placeholder="Sunday Worship"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px;
                margin:6px 0 16px;
              "
            >


            <label>
              <strong>
                Service date
              </strong>
            </label>

            <input
              id="choir-plan-date"
              type="date"
              required
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px;
                margin:6px 0 16px;
              "
            >


            <label>
              <strong>
                Service time
              </strong>
            </label>

            <input
              id="choir-plan-service-time"
              type="time"
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px;
                margin:6px 0 16px;
              "
            >


            <label
              style="
                display:flex;
                align-items:center;
                gap:8px;
                margin-bottom:20px;
              "
            >

              <input
                id="choir-plan-active"
                type="checkbox"
                checked
              >

              <strong>
                Published
              </strong>

            </label>


            <hr>


            <h3>
              Hymns
            </h3>


            <div
              id="choir-song-list"
            ></div>


            <button
              id="add-choir-song-button"
              type="button"
              style="
                width:100%;
                padding:11px;
                margin:10px 0 22px;
              "
            >
              + Add Hymn
            </button>


            <h3>
              Holy Spirit Hymn
            </h3>


            <div
              id="choir-holy-spirit-hymn"
            ></div>

            <hr>
            <h3>
              Choir Audio Message
            </h3>


            <div
              style="
                border:1px solid #eadcaa;
                border-radius:10px;
                padding:12px;
                margin-bottom:16px;
                background:#fff8df;
              "
            >
              <p
                id="choir-audio-status"
                style="
                  margin:0 0 8px;
                  font-size:14px;
                "
              >
                No audio message recorded.
              </p>

              <div id="choir-audio-preview"></div>

              <div
                id="choir-audio-recording-indicator"
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
                    animation:choirRecordingPulse 1s infinite;
                  "
                ></span>

                Recording choir message...
              </div>

              <button
                id="record-choir-audio-button"
                type="button"
                style="
                  width:100%;
                  padding:11px;
                  margin-top:10px;
                "
              >
                Record Choir Message
              </button>

              <button
                id="stop-choir-audio-button"
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
                id="remove-choir-audio-button"
                type="button"
                disabled
                style="
                  width:100%;
                  padding:11px;
                  margin-top:8px;
                "
              >
                Remove Audio Message
              </button>
            </div>


<div
              id="choir-admin-status"
              style="
                min-height:24px;
                margin-bottom:10px;
              "
            ></div>


            <button
              id="save-choir-plan-button"
              type="submit"
              style="
                width:100%;
                padding:13px;
                font-size:16px;
                font-weight:bold;
              "
            >
              Save Sunday Plan
            </button>

          </form>

        </div>

      </div>
      <style>
        @keyframes choirRecordingPulse {
          0% {
            transform:scale(1);
            opacity:1;
          }

          50% {
            transform:scale(1.25);
            opacity:.55;
          }

          100% {
            transform:scale(1);
            opacity:1;
          }
        }
      </style>
    `
  )
}
