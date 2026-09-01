const ABOUT_CONTENT_API =
  "https://order-app.gemegypt.net/api";

// Local testing:
// const ABOUT_CONTENT_API =
//   "http://localhost:5000";


document.addEventListener(
  "DOMContentLoaded",
  loadControlledAbout
);


async function loadControlledAbout() {

  try {

    const response =
      await fetch(
        `${ABOUT_CONTENT_API}/content/about`,
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


    const data =
      result.data || {};


    setText(
      "aboutStoryTitle",
      data.story_title
    );


    setText(
      "aboutStoryText",
      data.story_text
    );


    setText(
      "aboutPharmaciesValue",
      data.pharmacies_value
    );


    setText(
      "aboutPharmaciesLabel",
      data.pharmacies_label
    );


    setText(
      "aboutSalonsValue",
      data.salons_value
    );


    setText(
      "aboutSalonsLabel",
      data.salons_label
    );


    setText(
      "aboutOutletsValue",
      data.outlets_value
    );


    setText(
      "aboutOutletsLabel",
      data.outlets_label
    );


    setText(
      "aboutVisionHeading",
      data.vision_heading
    );


    setText(
      "aboutMissionTitle",
      data.mission_title
    );


    setText(
      "aboutMissionText",
      data.mission_text
    );


    setText(
      "aboutVisionTitle",
      data.vision_title
    );


    setText(
      "aboutVisionText",
      data.vision_text
    );


    const storyImage =
      document.getElementById(
        "aboutStoryImage"
      );


    if (
      storyImage
      &&
      data.story_image
    ) {

      storyImage.src =
        resolveAboutImage(
          data.story_image
        );

    }


  } catch (error) {

    console.error(
      "Unable to load About Us content:",
      error
    );

    // Original hardcoded HTML remains.

  }

}


function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (
    element
    &&
    value !== undefined
    &&
    value !== null
  ) {

    element.textContent =
      value;

  }

}


function resolveAboutImage(
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
    `${ABOUT_CONTENT_API}/images/${path}`
  );

}