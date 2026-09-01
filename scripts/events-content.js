const EVENTS_CONTENT_API =
  "https://order-app.gemegypt.net/api";

// Local testing:
// const EVENTS_CONTENT_API =
//   "http://localhost:5000";


document.addEventListener(
  "DOMContentLoaded",
  loadControlledEvents
);


async function loadControlledEvents() {

  const container =
    document.getElementById(
      "eventsGrid"
    );


  if (!container) {
    return;
  }


  try {

    const response =
      await fetch(
        `${EVENTS_CONTENT_API}/content/events`,
        {
          cache:
            "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const result =
      await response.json();


    const events =
      result.data || [];


    // Keep original hardcoded cards
    // if API has no events.

    if (!events.length) {
      return;
    }


    container.innerHTML =
      "";


    events.forEach(
      event => {

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "event-card";


        const link =
          document.createElement(
            "a"
          );


        link.href =
          "./event.html";


        const image =
          document.createElement(
            "img"
          );


        image.src =
          resolveEventImage(
            event.cover_image
          );


        image.dataset.src =
          image.src;


        image.alt =
          event.title;


        image.loading =
          "lazy";


        const overlay =
          document.createElement(
            "div"
          );


        overlay.className =
          "overlay";


        const title =
          document.createElement(
            "h3"
          );


        title.textContent =
          event.title;


        const year =
          document.createElement(
            "p"
          );


        year.textContent =
          event.year;


        overlay.appendChild(
          title
        );


        overlay.appendChild(
          year
        );


        link.appendChild(
          image
        );


        link.appendChild(
          overlay
        );


        link.addEventListener(
          "click",
          function(clickEvent) {

            clickEvent.preventDefault();


            const galleryImages =
              (event.images || [])
              .map(
                resolveEventImage
              );


            const selectedEvent = {

              title:
                event.title,

              year:
                event.year,

              logo:
                event.logo_image
                  ? resolveEventImage(
                      event.logo_image
                    )
                  : "",

              images:
                galleryImages

            };


            localStorage.setItem(
              "selectedEvent",
              JSON.stringify(
                selectedEvent
              )
            );


            window.location.href =
              "./event.html";

          }
        );


        card.appendChild(
          link
        );


        container.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "Unable to load controlled events:",
      error
    );

    // Existing hardcoded cards remain.

  }

}


function resolveEventImage(
  path
) {

  if (!path) {
    return "";
  }


  if (
    path.startsWith(
      "./assets/"
    )
  ) {

    return path;

  }


  if (
    path.startsWith(
      "http://"
    )
    ||
    path.startsWith(
      "https://"
    )
  ) {

    return path;

  }


  return (
    `${EVENTS_CONTENT_API}/images/${path}`
  );

}