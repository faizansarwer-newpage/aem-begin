import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia("(min-width: 900px)");

function closeOnEscape(e) {
  if (e.code === "Escape") {
    const nav = document.getElementById("nav");
    const navSections = nav.querySelector(".nav-sections");
    const navSectionExpanded = navSections.querySelector(
      '[aria-expanded="true"]'
    );
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector("button").focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === "nav-drop";
  if (isNavDrop && (e.code === "Enter" || e.code === "Space")) {
    const dropExpanded = focused.getAttribute("aria-expanded") === "true";
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest(".nav-sections"));
    focused.setAttribute("aria-expanded", dropExpanded ? "false" : "true");
  }
}

function focusNavSection() {
  document.activeElement.addEventListener("keydown", openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections
    .querySelectorAll(".nav-sections .default-content-wrapper > ul > li")
    .forEach((section) => {
      section.setAttribute("aria-expanded", expanded);
    });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded =
    forceExpanded !== null
      ? !forceExpanded
      : nav.getAttribute("aria-expanded") === "true";
  const button = nav.querySelector(".nav-hamburger button");
  document.body.style.overflowY = expanded || isDesktop.matches ? "" : "hidden";
  nav.setAttribute("aria-expanded", expanded ? "false" : "true");
  toggleAllNavSections(
    navSections,
    expanded || isDesktop.matches ? "false" : "true"
  );
  button.setAttribute(
    "aria-label",
    expanded ? "Open navigation" : "Close navigation"
  );
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll(".nav-drop");
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute("tabindex")) {
        drop.setAttribute("role", "button");
        drop.setAttribute("tabindex", 0);
        drop.addEventListener("focus", focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute("role");
      drop.removeAttribute("tabindex");
      drop.removeEventListener("focus", focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener("keydown", closeOnEscape);
  } else {
    window.removeEventListener("keydown", closeOnEscape);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata("nav");
  const navPath = navMeta ? new URL(navMeta).pathname : "/nav";
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  console.log(navMeta, navPath);
  const nav = document.createElement("nav");
  nav.id = "nav";
  // nav.classList = 'navbar navbar-expand-lg navbar-light bg-light';

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const sectionList = {};
  [...nav.children].forEach((section) => {
    const classList = [...section.classList];
    const firstClass = classList.shift();
    const currentSection = classList.shift();
    sectionList[currentSection] = {};
    if (currentSection === "navbar-brand") {
      const brand = section.querySelector(".default-content-wrapper p a");
      const url = brand.getAttribute("href");
      const picture = brand.querySelector("picture");
      sectionList[currentSection] = {
        url,
        picture,
      };
    }
    if (currentSection === "navbar-top") {
      const nav = section.querySelector(".default-content-wrapper ul");
      sectionList[currentSection] = parseListToJson(nav);
    }
    if (currentSection === "navbar-main") {
      const nav = section.querySelector(".default-content-wrapper ul");
      sectionList[currentSection] = parseListToJson(nav);
    }
    sectionList[currentSection].dataset = section.dataset;
  });
  console.log(nav, sectionList);

  setNavBar(block, sectionList);
}

function parseListToJson(ulElement) {
  function parseListItem(li) {
    const item = {
      text: li.firstChild.textContent.trim(),
    };
		// if text is not the only child then we need to find the text node
    li.childNodes.forEach( node => {
			if(node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
				item.text = node.textContent.trim();
			}
		});
    const link = li.querySelector("a");
    if (link) {
      item.link = link.href;
    }

    const picture = li.querySelector("picture");
    if (picture) {
      item.picture = picture;
    }

    const sublist = li.querySelector("ul");
    if (sublist) {
      item.children = parseList(sublist);
    }

    return item;
  }

  function parseList(list) {
    return Array.from(list.children).map((child) => parseListItem(child));
  }

  return parseList(ulElement);
}

function setNavBar(block, sectionList) {
  const header = `
  <div class="">
  <nav class="navbar navbar-expand-lg navbar-light bg-white">
    <div class="container">
      <div class="row w-100 p-0 m-0">
			<div class="d-flex col-sm-12 col-lg-2 p-0">
					<a class="navbar-brand" href="${sectionList["navbar-brand"].url}">
						${sectionList["navbar-brand"].picture.innerHTML||""	}
					</a>
					<button class="ms-auto navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
						<span class="navbar-toggler-icon"></span>
					</button>
			</div>
			<div class="d-lg-none p-0">
			<a class="nav-link p-0 m-0 text-primary fw-bold" href="${sectionList["navbar-top"][0].text}">${sectionList["navbar-top"][0].text} <i class="fa-solid fa-caret-right"></i><i class="fa-solid fa-caret-right"></i> </a>
			</div>
      ${generateTopNavigation(sectionList["navbar-top"])}
      ${generateMainMenu(sectionList["navbar-main"])}
      </div>
			
    </div>
		
  </nav>
	<div class="container border border-2 border-primary w-100 d-lg-none"></div>
  </div>`;
  block.innerHTML = header;
}
function generateTopNavigation(section) {
  return `
  <div class="col-lg-10 p-0 collapse navbar-collapse" id="navbarSupportedContent">
      
  <ul class="language-dropdown navbar-nav ms-auto mb-2 mb-lg-0 d-flex align-items-center">
    ${section
      .map(
        (item) => `${
          !item.children
            ? `<li class="nav-item">
        <a class="nav-link" aria-current="page" href="${item.link}">
					${item.picture?.innerHTML || ""}
					${item?.text}
				</a>
        </li>`
            : ""
        }
      ${
        item.children
          ? `<li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="${
            item.children[0].text
          }" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          ${item.picture?.innerHTML || ""}
					${item.text}
          </a>
          <ul class="dropdown-menu w-100" aria-labelledby="${
            item.children[0].text
          }">
            ${item.children
              .map(
                (subMenu) => `
            <li class="w-100" ><a class="dropdown-item" href="${subMenu.link}">
						${subMenu.picture?.innerHTML || ""}
						${subMenu.text}
						</a></li>
            `
              )
              .join("")}
          </ul>
        </li>`
          : ""
      }
        `
      )
      .join("")}
  </ul>
</div>
  `;
}
function generateMainMenu(menu) {
  const borderColors = menu.dataset.menuBorderColors
    .split(",")
    .map((color) => color.trim());
		console.log(borderColors);
  return `
  <div class="col-lg-12 p-0 collapse navbar-collapse" id="navbarSupportedContent">
  <ul class="bottom-navbar navbar-nav me-auto mb-2 mb-lg-0 d-flex w-100 text-center gap-1 justify-content-strech">
  ${menu
    .map(
      (item, index) => `${
        !item.children
          ? `<li class="nav-item border-bottom border-4 border-${borderColors[index]} p-0 w-35">
      <a class="nav-link p-3 mb-1" aria-current="page" href="${item.link}">${
              item.text ? item.text : item.picture.innerHTML
            }</a>
      </li>`
          : ""
      }
    ${
      item.children
        ? `<li class="nav-item border-bottom border-4 border-${borderColors[index]} p-0 dropdown">
        <a class="nav-link p-3 mb-1 dropdown-toggle" href="#" id="${
          item.children[0].text
        }" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        ${item.text}
        </a>
        <ul class="dropdown-menu" aria-labelledby="${item.children[0].text.trim()}">
          ${item.children
            .map(
              (subMenu) =>
                `<li class="w-100" ><a class="dropdown-item" href="${subMenu.link}">${subMenu.text}</a></li>`
            )
            .join("")}
        </ul>
      </li>`
        : ""
    }
      `
    )
    .join("")}
</ul></div>`;

  // return `<ul class="bottom-navbar navbar-nav me-auto mb-2 mb-lg-0 d-flex w-100 text-center gap-1 justify-content-strech">

  // <li class="nav-item border-bottom border-4 border-primary p-0 w-35 dropdown">
  //   <a class="nav-link p-3 mb-1 dropdown-toggle" id="aboutPneumococcalPneumonia" role="button" data-bs-toggle="dropdown" aria-expanded="false" href="#">About Pneumococcal Pneumonia</a>
  //   <ul class="dropdown-menu" aria-labelledby="aboutPneumococcalPneumonia">
  //       <li><a class="dropdown-item" href="#">What is Pneumococcal Pneumonia?</a></li>
  //       <li><a class="dropdown-item" href="#">Symptoms and impact</a></li>
  //     </ul>
  // </li>
  // <li class="nav-item  border-bottom border-4 border-warning p-0 w-30">
  //   <a class="nav-link p-3 mb-1 " aria-current="page" href="http://adult.prevnar20.com/">Understand your risk</a>
  // </li>
  // <li class="nav-item  border-bottom border-4 border-info p-0 w-25">
  //   <a class="nav-link p-3 mb-1 " aria-current="page" href="http://adult.prevnar20.com/">Help Protect yourself</a>
  // </li>
  // <li class="nav-item  border-bottom border-4 border-success p-0 w-15">
  //   <a class="nav-link p-3 mb-1 " aria-current="page" href="http://adult.prevnar20.com/">Take action</a>
  // </li>

  // </ul>`;
}
// function getBrand() {
//   const header = document.getElementById('nav');
//   console.log(header);
//   return 'image url'
// }
// export default function decorate(block) {
//   const brandImage = getBrand();
//   const header = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
//   <div class="container-fluid">
//     <a class="navbar-brand" href="#">Navbar</a>
//     <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
//       <span class="navbar-toggler-icon"></span>
//     </button>
//     <div class="collapse navbar-collapse" id="navbarSupportedContent">
//       <ul class="navbar-nav me-auto mb-2 mb-lg-0">
//         <li class="nav-item">
//           <a class="nav-link active" aria-current="page" href="#">Home</a>
//         </li>
//         <li class="nav-item">
//           <a class="nav-link" href="#">Link</a>
//         </li>
//         <li class="nav-item dropdown">
//           <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
//             Dropdown
//           </a>
//           <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
//             <li><a class="dropdown-item" href="#">Action</a></li>
//             <li><a class="dropdown-item" href="#">Another action</a></li>
//             <li><hr class="dropdown-divider"></li>
//             <li><a class="dropdown-item" href="#">Something else here</a></li>
//           </ul>
//         </li>
//         <li class="nav-item">
//           <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
//         </li>
//       </ul>
//       <form class="d-flex">
//         <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
//         <button class="btn btn-outline-success" type="submit">Search</button>
//       </form>
//     </div>
//   </div>
// </nav>`;
//   //block.innerHTML = header;
// }
