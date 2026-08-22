// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL =
  "https://order-app.gemegypt.net/api";

// Use this instead when testing against local Flask:
//
// const API_BASE_URL =
//   "http://localhost:5000";


const BLOG_PAGE_URL =
  "./blog.html";


// =====================================================
// STATE
// =====================================================

let contentToken =
  sessionStorage.getItem(
    "gem_content_token"
  );

let bloggers = [];

let sortable = null;


// =====================================================
// HELPERS
// =====================================================

function createId() {

  if (
    window.crypto
    &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString()
    +
    "-"
    +
    Math.random()
      .toString(36)
      .substring(2)
  );
}


// =====================================================
// API REQUEST
// =====================================================

async function contentRequest(
  path,
  options = {}
) {

  const headers = {
    ...(options.headers || {})
  };


  if (contentToken) {

    headers.Authorization =
      `Bearer ${contentToken}`;

  }


  if (
    options.body
    &&
    !(options.body instanceof FormData)
    &&
    !headers["Content-Type"]
  ) {

    headers["Content-Type"] =
      "application/json";

  }


  const fetchOptions = {
    ...options,
    headers
  };


  if (!fetchOptions.cache) {
    fetchOptions.cache = "no-store";
  }


  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      fetchOptions
    );


  let result = {};


  try {

    result =
      await response.json();

  } catch (_) {}


  if (!response.ok) {

    if (
      (
        response.status === 401
        ||
        response.status === 403
      )
      &&
      path !== "/content/login"
    ) {

      logoutLocally();

    }


    throw new Error(
      result.message
      ||
      result.error
      ||
      `Request failed: ${response.status}`
    );

  }


  return result;
}


// =====================================================
// LOGIN
// =====================================================

document
  .getElementById(
    "loginForm"
  )
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const username =
        document.getElementById(
          "loginUsername"
        ).value;


      const password =
        document.getElementById(
          "loginPassword"
        ).value;


      try {

        const result =
          await contentRequest(
            "/content/login",
            {

              method: "POST",

              body: JSON.stringify({
                username,
                password
              })

            }
          );


        contentToken =
          result.access_token;


        sessionStorage.setItem(
          "gem_content_token",
          contentToken
        );


        await openDashboard();


      } catch (error) {

        showMessage(
          error.message
        );

      }

    }
  );


// =====================================================
// LOGOUT
//
// There is intentionally NO backend logout endpoint.
//
// We simply remove the JWT from sessionStorage.
// It expires automatically after 8 hours.
// =====================================================

document
  .getElementById(
    "logoutButton"
  )
  .addEventListener(
    "click",
    function() {

      logoutLocally();

    }
  );


function logoutLocally() {

  sessionStorage.removeItem(
    "gem_content_token"
  );


  contentToken = null;


  document
    .getElementById(
      "dashboardView"
    )
    .classList.add(
      "hidden"
    );


  document
    .getElementById(
      "loginView"
    )
    .classList.remove(
      "hidden"
    );

}


// =====================================================
// OPEN DASHBOARD
// =====================================================

async function openDashboard() {

  try {

    await loadContact();

    await loadBloggers();


    document
      .getElementById(
        "loginView"
      )
      .classList.add(
        "hidden"
      );


    document
      .getElementById(
        "dashboardView"
      )
      .classList.remove(
        "hidden"
      );


  } catch (error) {

    logoutLocally();

    showMessage(
      error.message
    );

  }

}


// =====================================================
// VERIFY EXISTING SESSION
// =====================================================

async function restoreSession() {

  if (!contentToken) {
    return;
  }


  try {

    await contentRequest(
      "/content/check"
    );


    await openDashboard();


  } catch (error) {

    logoutLocally();

  }

}


// =====================================================
// TABS
// =====================================================

document
  .querySelectorAll(
    ".tab-button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        function() {

          document
            .querySelectorAll(
              ".tab-button"
            )
            .forEach(
              item => {

                item.classList.remove(
                  "active"
                );

              }
            );


          this.classList.add(
            "active"
          );


          document
            .querySelectorAll(
              ".panel"
            )
            .forEach(
              panel => {

                panel.classList.add(
                  "hidden"
                );

              }
            );


          document
            .getElementById(
              this.dataset.tab
            )
            .classList.remove(
              "hidden"
            );

        }
      );

    }
  );


// =====================================================
// CONTACT - LOAD
// =====================================================

async function loadContact() {

  const result =
    await contentRequest(
      "/content/editor/contact"
    );


  const data =
    result.data || {};


  document.getElementById(
    "sectionTitle"
  ).value =
    data.section_title || "";


  document.getElementById(
    "locationText"
  ).value =
    data.location_text || "";


  document.getElementById(
    "contactEmailEditor"
  ).value =
    data.email || "";


  document.getElementById(
    "phoneText"
  ).value =
    data.phone_text || "";


  document.getElementById(
    "followTitle"
  ).value =
    data.follow_title || "";


  document.getElementById(
    "facebookUrl"
  ).value =
    data.facebook_url || "";


  document.getElementById(
    "instagramUrl"
  ).value =
    data.instagram_url || "";


  document.getElementById(
    "tiktokUrl"
  ).value =
    data.tiktok_url || "";

}


// =====================================================
// CONTACT - SAVE
// =====================================================

document
  .getElementById(
    "contactFormEditor"
  )
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      try {

        await contentRequest(
          "/content/editor/contact",
          {

            method: "PUT",

            body: JSON.stringify({

              section_title:
                document.getElementById(
                  "sectionTitle"
                ).value,

              location_text:
                document.getElementById(
                  "locationText"
                ).value,

              email:
                document.getElementById(
                  "contactEmailEditor"
                ).value,

              phone_text:
                document.getElementById(
                  "phoneText"
                ).value,

              follow_title:
                document.getElementById(
                  "followTitle"
                ).value,

              facebook_url:
                document.getElementById(
                  "facebookUrl"
                ).value,

              instagram_url:
                document.getElementById(
                  "instagramUrl"
                ).value,

              tiktok_url:
                document.getElementById(
                  "tiktokUrl"
                ).value

            })

          }
        );


        showMessage(
          "Contact information saved"
        );


      } catch (error) {

        showMessage(
          error.message
        );

      }

    }
  );


// =====================================================
// BLOGGERS - LOAD
// =====================================================

async function loadBloggers() {

  const result =
    await contentRequest(
      "/content/editor/bloggers"
    );


  bloggers =
    result.data || [];


  renderBloggers();

}


// =====================================================
// BLOGGERS - SAVE COMPLETE ARRAY
//
// THIS IS THE IMPORTANT DIFFERENCE FROM YOUR OLD JS.
//
// We do not POST/DELETE individual bloggers anymore.
//
// We send the complete array to content.py.
// =====================================================

async function saveBloggers(
  successMessage = null
) {

  const result =
    await contentRequest(
      "/content/editor/bloggers",
      {

        method: "PUT",

        body: JSON.stringify({
          bloggers
        })

      }
    );


  bloggers =
    result.data || [];


  renderBloggers();


  if (successMessage) {

    showMessage(
      successMessage
    );

  }

}


// =====================================================
// BLOGGERS - RENDER
// =====================================================

function renderBloggers() {

  const container =
    document.getElementById(
      "bloggersList"
    );


  container.innerHTML =
    "";


  bloggers.forEach(
    blogger => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "blogger-item";


      if (!blogger.visible) {

        row.classList.add(
          "hidden-item"
        );

      }


      // IMPORTANT:
      // content.py uses "id", not "blogger_id"

      row.dataset.id =
        blogger.id;


      // -----------------------------------------
      // Drag handle
      // -----------------------------------------

      const drag =
        document.createElement(
          "div"
        );


      drag.className =
        "drag-handle";


      drag.textContent =
        "☰";


      // -----------------------------------------
      // Image
      // -----------------------------------------

      const image =
        document.createElement(
          "img"
        );


      image.src =
        resolveDashboardImage(
          blogger.image_path
        );


      image.alt =
        blogger.name;


      // -----------------------------------------
      // Blogger information
      // -----------------------------------------

      const info =
        document.createElement(
          "div"
        );


      const name =
        document.createElement(
          "div"
        );


      name.className =
        "blogger-name";


      name.textContent =
        blogger.name;


      const url =
        document.createElement(
          "div"
        );


      url.className =
        "blogger-url";


      url.textContent =
        blogger.instagram_url;


      info.appendChild(
        name
      );


      info.appendChild(
        url
      );


      // -----------------------------------------
      // Visibility
      // -----------------------------------------

      const visibility =
        document.createElement(
          "label"
        );


      visibility.className =
        "visibility";


      const checkbox =
        document.createElement(
          "input"
        );


      checkbox.type =
        "checkbox";


      checkbox.checked =
        blogger.visible;


      const visibilityText =
        document.createElement(
          "span"
        );


      visibilityText.textContent =
        blogger.visible
          ? "Visible"
          : "Hidden";


      checkbox.addEventListener(
        "change",
        async function() {

          const oldValue =
            blogger.visible;


          blogger.visible =
            checkbox.checked;


          try {

            await saveBloggers(
              "Visibility updated"
            );


          } catch (error) {

            blogger.visible =
              oldValue;


            renderBloggers();


            showMessage(
              error.message
            );

          }

        }
      );


      visibility.appendChild(
        checkbox
      );


      visibility.appendChild(
        visibilityText
      );


      // -----------------------------------------
      // Edit
      // -----------------------------------------

      const editButton =
        document.createElement(
          "button"
        );


      editButton.type =
        "button";


      editButton.className =
        "action";


      editButton.textContent =
        "Edit";


      editButton.addEventListener(
        "click",
        function() {

          editBlogger(
            blogger
          );

        }
      );


      // -----------------------------------------
      // Delete
      // -----------------------------------------

      const deleteButton =
        document.createElement(
          "button"
        );


      deleteButton.type =
        "button";


      deleteButton.className =
        "danger action";


      deleteButton.textContent =
        "Delete";


      deleteButton.addEventListener(
        "click",
        function() {

          deleteBlogger(
            blogger
          );

        }
      );


      // -----------------------------------------
      // Add everything to row
      // -----------------------------------------

      row.appendChild(
        drag
      );


      row.appendChild(
        image
      );


      row.appendChild(
        info
      );


      row.appendChild(
        visibility
      );


      row.appendChild(
        editButton
      );


      row.appendChild(
        deleteButton
      );


      container.appendChild(
        row
      );

    }
  );


  setupSortable();

}


// =====================================================
// DRAG & DROP
// =====================================================

function setupSortable() {

  if (sortable) {

    sortable.destroy();

  }


  sortable =
    new Sortable(
      document.getElementById(
        "bloggersList"
      ),
      {

        animation: 150,

        handle:
          ".drag-handle",

        onEnd:
          saveBloggerOrder

      }
    );

}


async function saveBloggerOrder() {

  const orderedIds =
    Array.from(
      document.querySelectorAll(
        "#bloggersList .blogger-item"
      )
    )
    .map(
      element =>
        element.dataset.id
    );


  const bloggerMap =
    new Map(
      bloggers.map(
        blogger => [
          String(blogger.id),
          blogger
        ]
      )
    );


  const reordered =
    orderedIds
      .map(
        id =>
          bloggerMap.get(
            String(id)
          )
      )
      .filter(Boolean);


  if (
    reordered.length
    !== bloggers.length
  ) {

    showMessage(
      "Unable to determine blogger order"
    );


    await loadBloggers();

    return;

  }


  bloggers =
    reordered;


  try {

    await saveBloggers(
      "Blogger order saved"
    );


  } catch (error) {

    showMessage(
      error.message
    );


    await loadBloggers();

  }

}


// =====================================================
// IMAGE UPLOAD
// =====================================================

async function uploadBloggerImage(
  file
) {

  const formData =
    new FormData();


  formData.append(
    "image",
    file
  );


  const result =
    await contentRequest(
      "/content/editor/bloggers/image",
      {

        method: "POST",

        body:
          formData

      }
    );


  return (
    result.image_path
  );

}


// =====================================================
// ADD / EDIT BLOGGER
// =====================================================

document
  .getElementById(
    "bloggerForm"
  )
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const bloggerId =
        document.getElementById(
          "bloggerId"
        ).value;


      const name =
        document.getElementById(
          "bloggerNameInput"
        ).value.trim();


      const instagramUrl =
        document.getElementById(
          "bloggerUrlInput"
        ).value.trim();


      const visible =
        document.getElementById(
          "bloggerVisibleInput"
        ).checked;


      const imageInput =
        document.getElementById(
          "bloggerImageInput"
        );


      let existingBlogger = null;


      if (bloggerId) {

        existingBlogger =
          bloggers.find(
            blogger =>
              String(blogger.id)
              ===
              String(bloggerId)
          );


        if (!existingBlogger) {

          showMessage(
            "Blogger not found"
          );

          return;

        }

      }


      if (
        !existingBlogger
        &&
        !imageInput.files.length
      ) {

        showMessage(
          "Image is required for a new blogger"
        );

        return;

      }


      try {

        let imagePath =
          existingBlogger
            ? existingBlogger.image_path
            : "";


        if (
          imageInput.files.length
        ) {

          imagePath =
            await uploadBloggerImage(
              imageInput.files[0]
            );

        }


        if (existingBlogger) {

          existingBlogger.name =
            name;


          existingBlogger.instagram_url =
            instagramUrl;


          existingBlogger.image_path =
            imagePath;


          existingBlogger.visible =
            visible;


          await saveBloggers(
            "Blogger updated"
          );


        } else {

          bloggers.push({

            id:
              createId(),

            name:
              name,

            instagram_url:
              instagramUrl,

            image_path:
              imagePath,

            visible:
              visible

          });


          await saveBloggers(
            "Blogger added"
          );

        }


        resetBloggerForm();


      } catch (error) {

        showMessage(
          error.message
        );


        await loadBloggers();

      }

    }
  );


// =====================================================
// EDIT BLOGGER FORM
// =====================================================

function editBlogger(
  blogger
) {

  document.getElementById(
    "bloggerId"
  ).value =
    blogger.id;


  document.getElementById(
    "bloggerNameInput"
  ).value =
    blogger.name;


  document.getElementById(
    "bloggerUrlInput"
  ).value =
    blogger.instagram_url;


  document.getElementById(
    "bloggerVisibleInput"
  ).checked =
    blogger.visible;


  document.getElementById(
    "bloggerImageInput"
  ).value =
    "";


  document.getElementById(
    "bloggerFormTitle"
  ).textContent =
    "Edit Blogger";


  document.getElementById(
    "cancelEditButton"
  ).classList.remove(
    "hidden"
  );


  document
    .getElementById(
      "bloggerForm"
    )
    .scrollIntoView({
      behavior:
        "smooth"
    });

}


// =====================================================
// CANCEL EDIT
// =====================================================

document
  .getElementById(
    "cancelEditButton"
  )
  .addEventListener(
    "click",
    resetBloggerForm
  );


function resetBloggerForm() {

  document
    .getElementById(
      "bloggerForm"
    )
    .reset();


  document.getElementById(
    "bloggerId"
  ).value =
    "";


  document.getElementById(
    "bloggerVisibleInput"
  ).checked =
    true;


  document.getElementById(
    "bloggerFormTitle"
  ).textContent =
    "Add Blogger";


  document.getElementById(
    "cancelEditButton"
  ).classList.add(
    "hidden"
  );

}


// =====================================================
// DELETE BLOGGER
// =====================================================

async function deleteBlogger(
  blogger
) {

  const confirmed =
    confirm(
      `Delete ${blogger.name}?`
    );


  if (!confirmed) {
    return;
  }


  const previousBloggers =
    [...bloggers];


  bloggers =
    bloggers.filter(
      item =>
        String(item.id)
        !==
        String(blogger.id)
    );


  try {

    await saveBloggers(
      "Blogger deleted"
    );


  } catch (error) {

    bloggers =
      previousBloggers;


    renderBloggers();


    showMessage(
      error.message
    );

  }

}


// =====================================================
// IMPORT EXISTING HARDCODED BLOGGERS
// =====================================================

document
  .getElementById(
    "importCurrentBloggers"
  )
  .addEventListener(
    "click",
    importCurrentBloggers
  );


async function importCurrentBloggers() {

  if (bloggers.length) {

    const confirmed =
      confirm(
        "Bloggers already exist in the "
        +
        "content file. Replace them "
        +
        "with the bloggers currently "
        +
        "inside blog.html?"
      );


    if (!confirmed) {
      return;
    }

  }


  try {

    const response =
      await fetch(
        BLOG_PAGE_URL,
        {
          cache:
            "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Unable to read blog.html"
      );

    }


    const html =
      await response.text();


    const parser =
      new DOMParser();


    const blogDocument =
      parser.parseFromString(
        html,
        "text/html"
      );


    const cards =
      blogDocument.querySelectorAll(
        ".blogger-card"
      );


    if (!cards.length) {

      throw new Error(
        "No blogger cards found in blog.html"
      );

    }


    const imported = [];


    cards.forEach(
      card => {

        const nameElement =
          card.querySelector(
            ".blogger-name"
          );


        const imageElement =
          card.querySelector(
            "img"
          );


        const instagramUrl =
          card.getAttribute(
            "href"
          );


        const imagePath =
          imageElement
            ?.getAttribute(
              "src"
            );


        const name =
          nameElement
            ?.textContent
            .trim();


        if (
          !name
          ||
          !instagramUrl
          ||
          !imagePath
        ) {

          return;

        }


        imported.push({

          id:
            createId(),

          name:
            name,

          instagram_url:
            instagramUrl,

          image_path:
            imagePath,

          visible:
            true

        });

      }
    );


    bloggers =
      imported;


    await saveBloggers(
      `${imported.length} bloggers imported`
    );


  } catch (error) {

    showMessage(
      error.message
    );

  }

}


// =====================================================
// IMAGE URL FOR DASHBOARD
// =====================================================

function resolveDashboardImage(
  path
) {

  if (!path) {
    return "";
  }


  // Existing website asset

  if (
    path.startsWith(
      "./assets/"
    )
  ) {

    return path;

  }


  // External image

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


  // Flask uploaded image

  return (
    `${API_BASE_URL}/images/${path}`
  );

}


// =====================================================
// UI MESSAGE
// =====================================================

function showMessage(
  text
) {

  const message =
    document.getElementById(
      "message"
    );


  message.textContent =
    text;


  message.style.display =
    "block";


  clearTimeout(
    showMessage.timer
  );


  showMessage.timer =
    setTimeout(
      function() {

        message.style.display =
          "none";

      },
      3000
    );

}


// =====================================================
// START
// =====================================================

restoreSession();