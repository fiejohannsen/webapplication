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
  if (pageId == "myplants") {
    document.getElementById("notification").style.display = "none";
  }
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
const userRef = db.collection("users");
let currentUser = null;
let selectedPlants = [];
let plants = [];

// ========== READ ==========
// Watch the database ref for changes
plantRef.onSnapshot(function(snapshotData) {
  plants = snapshotData.docs;
  appendPlants(plants);
});

// Append plants to the DOM //
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
            <a class="halfway-fab waves-effect waves-light" onclick="addPlant('${plant.id}')">
              <i class="medium material-icons">add_circle</i>
            </a>
            <img src="${plant.data().img}">
            <span class="card-title"><h3>${plant.data().name}</h3></span>
            </div>
        </div>
      </div>
    </div>
    `;
  }
  document.querySelector('#plant-container').innerHTML = htmlTemplate;
}




// Search function in "Add" topbar //
function addSearch(value) {
  console.log(value);
  let filteredPlants = [];
  for (let plant of plants) {
    let name = plant.data().name.toLowerCase();
    if (name.includes(value.toLowerCase())) {
      filteredPlants.push(plant);
    }
  }
  console.log(filteredPlants);
  appendPlants(filteredPlants);
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
    currentUser = user;
    setDefaultPage();
    tabbar.classList.remove("hide");
    initializeMyPlants();
  } else { // if user is not logged in
    currentUser = null;
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

// ============== my plants setup ============== // henter alle myplants fra den enkelte bruger (currentuser.uid)
function initializeMyPlants() {
  // read my plants from firebase
  userRef.doc(currentUser.uid).onSnapshot(function(snapshotData) {

    let myPlants = snapshotData.data().myPlants;
    if (myPlants.length === 0) {
      document.querySelector('#my-plants-container').innerHTML = `
      <article class="welcome-container">
      <h2>Hi ${currentUser.displayName.split(" ")[0]}</h2>
    <h5>You can now add<br>your plants.<br><br>Let's get started!</h5>
      <a class="halfway-fab waves-effect waves-light" onclick="showPage('add')">
      <i class="large material-icons">add_circle_outline</i>
        </a>
      </article>
`; //skriv det der
    }
    selectedPlants = [];
    for (let myPlant of myPlants) {
      plantRef.doc(myPlant).get().then(function(doc) {
        selectedPlants.push(doc);
        appendMyPlants(selectedPlants);
      });
    }
  });
}





function addPlant(plantId) {
  userRef.doc(currentUser.uid).set({
    myPlants: firebase.firestore.FieldValue.arrayUnion(plantId)
  }, {
    merge: true
  });
  document.getElementById("notification").style.display = "block";
}


function deletePlant(plantId) {
  userRef.doc(currentUser.uid).update({
    myPlants: firebase.firestore.FieldValue.arrayRemove(plantId)
  });
}



function appendMyPlants(mySelectedPlants) {
  let htmlTemplate = "";
  for (let plant of mySelectedPlants) {
    console.log(plant.id);
    console.log(plant.data().name);
    htmlTemplate += `
    <div class="card addedcard">
    <span class="card-title"><h3>${plant.data().name}</h3></span>

      <div class="card-image added-plant-card-image">
        <a class="halfway-fab waves-effect waves-light" onclick="deletePlant('${plant.id}')">
          <i class="medium material-icons">cancel</i>
        </a>
        <img src="${plant.data().img}">
      </div>
      <div class="card-content">
        <img class="card-icon" src="${plant.data().watericon}">
        <p>${plant.data().water}</p>
        <img class="card-icon" src="${plant.data().shadeicon}">
        <p>${plant.data().shade}</p>
        <img class="cal-img" src="${plant.data().calendar}">
        <div class="switch">
  <label>
    <input type="checkbox">
    <span class="lever"></span>
    Remind me
  </label>
</div>
      </div>
    </div>
    `;
  }
  document.querySelector('#my-plants-container').innerHTML = htmlTemplate;
}

// Search function in "My Plants" topbar //
function myplantsSearch(value) {
  console.log(value);
  let filteredPlants = [];
  for (let plant of selectedPlants) {
    let name = plant.data().name.toLowerCase();
    if (name.includes(value.toLowerCase())) {
      filteredPlants.push(plant);
    }
  }
  console.log(filteredPlants);
  appendMyPlants(filteredPlants);
}