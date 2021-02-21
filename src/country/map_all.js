// initial global vars
const state = {
  current: {
    level: 1,
    score: 0,
  },
  best: {
    level: 1,
    score: 0,
  },
  solution: {
    name: "",
    index: 0,
    bonus: 0,
  },
};

var nav;
var bar;

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2V2ZXJvYm8iLCJhIjoiY2trdTUxbWplMWs4ZDJxcW4wNDN6eTJ4bCJ9.nCWWPY2Lb8WuEngFH3GKNQ";

var cities = [];

// function for showing the map given a level

const filters = new Map([
  // [10, (d) => d["worldcity"] > 0],
  // [20, (d) => d["scalerank"] < 3],
  // [30, (d) => d["megacity"] > 0],
  // [40, (d) => d["gn_pop"] > 3000000],
  // [50, (d) => d["gn_pop"] > 2000000],
  // [60, (d) => d["scalerank"] < 5],
  // [Infinity, (d) => d["scalerank"] < 12],
  [Infinity, (d) => true],
]);

// https://stackoverflow.com/a/54160546/7351594
function getRandomIndex(n) {
  return Math.trunc(Math.random() * n);
}
function sample(array, size) {
  const results = [],
    sampled = {};
  while (results.length < size && results.length < array.length) {
    const index = getRandomIndex(array.length);
    if (!sampled[index]) {
      results.push(array[index]);
      sampled[index] = true;
    }
  }
  return results;
}

function showMap() {
  // generating an array of cities for this level, based on the level criteria

  const filter = [...filters.entries()].find(
    ([k, v]) => k > state.current.level
  )[1];
  const level_array = cities.features.filter((d) => filter(d.properties));

  // a random 4 cities from the array of cities
  const cities_select = sample(level_array, 4);

  // random city of these 4
  state.solution.index = getRandomIndex(4);
  const cities_solution = cities_select[state.solution.index];
  state.solution.name = cities_solution.properties.name;
  state.solution.bonus =
    100 *
    (5 +
      5 * (1 - cities_solution["properties"]["worldcity"]) +
      +cities_solution["properties"]["scalerank"]);

  // setting up the map to centre on a City
  var cx = cities_solution["geometry"]["coordinates"][0];
  var cy = cities_solution["geometry"]["coordinates"][1];

  var bounds = [
    [cx - 0.42, cy - 0.42], // Southwest
    [cx + 0.42, cy + 0.42], // Northeast
  ];

  // TODO: update, don't reinstantiate
  var map = new mapboxgl.Map({
    container: "map", // container id
    style: "mapbox://styles/severobo/ckku5e4l92qh117n4v7kmg91k", // stylesheet location
    center: [cx, cy], // starting position [lng, lat]
    //zoom: 11.5, // starting zoom
    zoom: 12.5,
    maxZoom: 16,
    minZoom: 11,
    // pitchWithRotate: false,
    maxBounds: bounds, // Sets bounds as max
  });
  map.dragRotate._pitchWithRotate = false;

  // adding controls to the map
  nav && map.removeControl(nav);
  nav = new mapboxgl.NavigationControl();
  map.addControl(nav, "top-left");

  bar && map.removeControl(bar);
  bar = new mapboxgl.ScaleControl({
    maxWidth: 100,
    unit: "metric",
  });
  map.addControl(bar);

  // adding names to the form
  for (const [i, city] of cities_select.entries()) {
    document.getElementById(`p${i + 1}`).innerHTML =
      "<b>" +
      city["properties"]["name"] +
      "</b>, " +
      city["properties"]["adm0name"];
  }
}

// messages for when somone answeres correct
var yesses = [
  "Yes! Yes! Yes!",
  "Indeed",
  "Correct!",
  "Si",
  "Well Done!",
  "Ole!",
  ":)",
  "Perfecto",
  "Excellent!",
  "Hooray!",
  "Huzzah",
];

// function for what happens when submit is clicked
function submitAnswers() {
  // grab the value of result (1 to 4)
  const answer = +document.forms["quizForm"]["q1"].value - 1;

  if (answer === state.solution.index) {
    //update the level and the score
    state.current.level += 1;
    state.current.score += state.solution.bonus;

    // update the DOM
    document.getElementById("message").innerHTML =
      yesses[getRandomIndex(yesses.length)];
    document.getElementById("section").style.backgroundColor = "#FCFAF2";
    document.getElementById("att").style.backgroundColor = "#FCFAF2";
  } else {
    // reset state
    state.current.level = 1;
    state.current.score = 0;
    remap = 1;

    // Update the DOM
    document.getElementById("message").innerHTML =
      "<b>Game Over :(</b> <br><br>&nbsp;the correct answer was<br>&nbsp;" +
      state.solution.name +
      "<br><br>&nbsp;please restart";
    document.getElementById("section").style.backgroundColor = "#FF9D70";
    document.getElementById("att").style.backgroundColor = "#FF9D70";
  }

  // update high level and score (they are nto directly related!)
  state.best.level = Math.max(state.current.level, state.best.level);
  state.best.score = Math.max(state.current.score, state.best.score);

  // Update the DOM
  document.getElementById("level").innerHTML = state.current.level + "";
  document.getElementById("score").innerHTML = state.current.score + "";
  document.getElementById("hlevel").innerHTML = state.best.level + "";
  document.getElementById("hscore").innerHTML = state.best.score + "";

  // show the next map
  showMap();

  return false;
}

// show the initial map
function fetchCities() {
  return fetch("./places.json").then((d) => d.json());
}

(async () => {
  cities = await fetchCities();
  showMap();
})();
