

(function () {
  "use strict";

  const assignments = new Map();
  let currentImage = null;

  const imgEl          = document.getElementById("currentImage");
  const loader         = document.getElementById("imageLoader");
  const imageMeta      = document.getElementById("imageMeta");
  const emailInput     = document.getElementById("emailInput");
  const inputError     = document.getElementById("inputError");
  const assignBtn      = document.getElementById("assignBtn");
  const nextBtn        = document.getElementById("nextBtn");
  const gallerySection = document.getElementById("gallerySection");
  const galleryGrid    = document.getElementById("galleryGrid");
  const galleryCount   = document.getElementById("galleryCount");
  const assignPanel    = document.querySelector(".assign-panel");

  //  Email validation 
 
  function validateEmail(val) {
    if (!val || val.trim() === "")
      return "An email address is required";

    if (/\s/.test(val))
      return "Email address must not contain spaces";

    if (!val.includes("@"))
      return "Must include an @ symbol — e.g. name@example.com";

    const parts = val.split("@");

    if (parts.length > 2)
      return "Email address must contain only one @ symbol";

    const local  = parts[0];
    const domain = parts[1];

    if (local.length === 0)
      return "Please enter a name before the @ symbol";

    if (!domain || domain.length === 0)
      return "Please enter a domain after the @ symbol";

    if (!domain.includes("."))
      return "Domain must include a dot — e.g. example.com";

    const tld = domain.split(".").pop();

    if (tld.length < 2)
      return "Domain extension must be 2+ characters — e.g. .com or .co.uk";

    return null;
  }

  //  Load image 
  function loadImage() {
    const id  = Math.floor(Math.random() * 1000) + 1;
    const src = "https://picsum.photos/id/" + id + "/900/600";

    imgEl.classList.remove("loaded");
    imgEl.style.display = "none";
    loader.classList.remove("hidden");
    imageMeta.textContent = "";
    assignBtn.disabled = true;
    nextBtn.disabled = true;

    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";

    tempImg.onload = function () {
      currentImage = { src, id };
      imgEl.src = src;
      imgEl.style.display = "block";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          imgEl.classList.add("loaded");
          loader.classList.add("hidden");
          imageMeta.textContent = "Photo #" + id + " · picsum.photos";
          assignBtn.disabled = !!validateEmail(emailInput.value.trim());
          nextBtn.disabled = false;
        });
      });
    };

    tempImg.onerror = function () { loadImage(); };
    tempImg.src = src;
  }

  //  Assign 
  function assign() {
    const email = emailInput.value.trim().toLowerCase();
    const err   = validateEmail(email);

    if (err) {
      inputError.textContent = err;
      emailInput.classList.add("error");
      emailInput.focus();
      return;
    }

    inputError.textContent = "";
    emailInput.classList.remove("error");

    if (!assignments.has(email)) assignments.set(email, []);
    var imgData = { src: currentImage.src, id: currentImage.id };
    assignments.get(email).push(imgData);

    assignPanel.classList.add("flash");
    setTimeout(function () { assignPanel.classList.remove("flash"); }, 500);

    addToGallery(email, imgData);
  }

  //  Gallery 
  function createThumb(imgData, idx) {
    var thumb = document.createElement("div"); thumb.className = "gallery-thumb";
    var lbl   = document.createElement("div"); lbl.className = "thumb-index";
    lbl.textContent = String(idx + 1).padStart(2, "0");
    var img = document.createElement("img");
    img.src = imgData.src; img.alt = "Photo " + imgData.id; img.loading = "lazy";
    thumb.appendChild(img); thumb.appendChild(lbl);
    return thumb;
  }

  function updateCount() {
    var total = 0;
    assignments.forEach(function (imgs) { total += imgs.length; });
    galleryCount.textContent = total + " image" + (total !== 1 ? "s" : "") +
      " · " + assignments.size + " email" + (assignments.size !== 1 ? "s" : "");
  }

  function addToGallery(email, imgData) {
    gallerySection.style.display = "block";
    updateCount();

    // Find existing group for this email
    var existingGroup = null;
    var groups = galleryGrid.getElementsByClassName("email-group");
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].getAttribute("data-email") === email) {
        existingGroup = groups[i]; break;
      }
    }

    if (existingGroup) {
      var imgs = assignments.get(email);
      existingGroup.querySelector(".email-count-badge").textContent =
        imgs.length + " image" + (imgs.length !== 1 ? "s" : "");
      existingGroup.querySelector(".email-images").appendChild(createThumb(imgData, imgs.length - 1));
    } else {
      var group  = document.createElement("div"); group.className = "email-group";
      group.setAttribute("data-email", email);
      var header = document.createElement("div"); header.className = "email-group-header";
      var addr   = document.createElement("span"); addr.className = "email-address"; addr.textContent = email;
      var badge  = document.createElement("span"); badge.className = "email-count-badge"; badge.textContent = "1 image";
      header.appendChild(addr); header.appendChild(badge);
      var grid = document.createElement("div"); grid.className = "email-images";
      grid.appendChild(createThumb(imgData, 0));
      group.appendChild(header); group.appendChild(grid);
      galleryGrid.appendChild(group);
    }
  }

  //  Events 
  emailInput.addEventListener("input", function () {
    var val = this.value.trim();
    var err = validateEmail(val);
    if (val.length > 0 && err) {
      inputError.textContent = err;
      emailInput.classList.add("error");
    } else {
      inputError.textContent = "";
      emailInput.classList.remove("error");
    }
    assignBtn.disabled = !!err || !currentImage;
  });

  emailInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") assign();
  });

  assignBtn.addEventListener("click", assign);
  nextBtn.addEventListener("click", loadImage);

  loadImage();
})();