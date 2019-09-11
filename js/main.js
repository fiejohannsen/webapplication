"use strict";

// hide all pages
function hideAllPages() {
  let pages = document.querySelectorAll(".page");
  for (let page of pages) {
    page.style.display = "none";
  }
}

// show page or tab
function showPage(pageId) {
  hideAllPages();
  document.querySelector(`#${pageId}`).style.display = "block";
  location.href = `#${pageId}`;
  setActiveTab(pageId);
}

// sets active tabbar/ menu item
function setActiveTab(pageId) {
  let pages = document.querySelectorAll(".tabbar a");
  for (let page of pages) {
    if (`#${pageId}` === page.getAttribute("href")) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }

  }
}

// set default page
function setDefaultPage() {
  let page = "myplants";
  if (location.hash) {
    page = location.hash.slice(1);
  }
  showPage(page);
}


function showLoader(show) {
  let loader = document.querySelector('#loader');
  if (show) {
    loader.classList.remove("hide");
  } else {
    loader.classList.add("hide");
  }
}

// ========== Firebase sign in functionality ========== //

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzlcvXdk_pCg4yRhFLW_WzXwA87TRgG08",
  authDomain: "plant-app-36c9b.firebaseapp.com",
  databaseURL: "https://plant-app-36c9b.firebaseio.com",
  projectId: "plant-app-36c9b",
  storageBucket: "plant-app-36c9b.appspot.com",
  messagingSenderId: "224216882705",
  appId: "1:224216882705:web:8b99da9cce02daf8499bb0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const plantRef = db.collection("plants");

let selectedPlantId = "";

// ========== READ ==========
// watch the database ref for changes
plantRef.onSnapshot(function(snapshotData) {
  let plants = snapshotData.docs;
  appendPlants(plants);
});

// append users to the DOM
function appendPlants(plants) {
  let htmlTemplate = "";
  for (let plant of plants) {
    console.log(plant.id);
    console.log(plant.data().name);
    htmlTemplate += `
    <div class="row">
  <div class="col s12 m6">
    <div class="card">
      <div class="card-image">
      <img src="${plant.data().img}">
        <span class="card-title"><h3>${plant.data().name}</h3>
</span>
        <a class="btn-floating halfway-fab waves-effect waves-light red">+</a>
      </div>
      <div class="card-content">
      <img src="${plant.data().watericon}">
      <p>${plant.data().water}</p>
      <img src="${plant.data().shadeicon}">
      <p>${plant.data().shade}</p>
      <img src="${plant.data().calendar}">
      </div>
    </div>
  </div>
</div>
    `;
  }
  document.querySelector('#plant-container').innerHTML = htmlTemplate;
}





// Firebase UI configuration
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  signInSuccessUrl: '#myplants',
};

// Init Firebase UI Authentication
const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Listen on authentication state change
firebase.auth().onAuthStateChanged(function(user) {
  let tabbar = document.querySelector('#tabbar');
  console.log(user);
  if (user) { // if user exists and is authenticated
    setDefaultPage();
    tabbar.classList.remove("hide");
    appendUserData(user);
  } else { // if user is not logged in
    showPage("login");
    tabbar.classList.add("hide");
    ui.start('#firebaseui-auth-container', uiConfig);
  }
  showLoader(false);
});

// sign out user
function logout() {
  firebase.auth().signOut();
}

function appendUserData(user) {
  document.querySelector('#myplants').innerHTML += `
    <h3>${user.displayName}</h3>
    <p>${user.email}</p>
  `;
}