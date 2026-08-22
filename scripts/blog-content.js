document.addEventListener(
  "DOMContentLoaded",
  loadControlledBloggers
);


async function loadControlledBloggers() {

  const container =
    document.getElementById(
      "bloggersGrid"
    );


  if (!container) {
    return;
  }


  try {

    const response = await fetch(
      `${API_BASE_URL}/content/bloggers`
    );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const result =
      await response.json();


    const bloggers =
      result.data || [];


    // Very important:
    //
    // Until you import bloggers
    // through the dashboard,
    // leave the existing hardcoded
    // cards on the page.

    if (!bloggers.length) {
      return;
    }


    container.innerHTML =
      "";


    bloggers.forEach(
      blogger => {

        const card =
          document.createElement(
            "a"
          );


        card.className =
          "blogger-card";


        card.href =
          blogger.instagram_url;


        card.target =
          "_blank";


        card.rel =
          "noopener noreferrer";


        const imageWrapper =
          document.createElement(
            "div"
          );


        imageWrapper.className =
          "blogger-img-wrapper";


        const image =
          document.createElement(
            "img"
          );


        image.src =
          resolveBloggerImage(
            blogger.image_path
          );


        image.alt =
          blogger.name;


        image.loading =
          "lazy";


        const name =
          document.createElement(
            "p"
          );


        name.className =
          "blogger-name";


        name.textContent =
          blogger.name;


        imageWrapper.appendChild(
          image
        );


        card.appendChild(
          imageWrapper
        );


        card.appendChild(
          name
        );


        container.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "Unable to load controlled bloggers:",
      error
    );

    // Keep original HTML bloggers.

  }

}


function resolveBloggerImage(
  path
) {

  if (!path) {
    return "";
  }


  // Original frontend images

  if (
    path.startsWith(
      "./assets/"
    )
  ) {

    return path;

  }


  // External images

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


  // Images uploaded by dashboard

  return (
    `${API_BASE_URL}/images/${path}`
  );

}