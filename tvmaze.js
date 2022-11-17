"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

const SHOWS_BASE_URL = "http://api.tvmaze.com/search/shows";
const EPISODES_BASE_URL = "http://api.tvmaze.com/shows/";
const MISSING_IMG_URL = "https://tinyurl.com/tv-missing";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const shows = await axios.get(SHOWS_BASE_URL, { params: { q: term } });

  const showsCollection = shows.data.map(show => {
    return {id: show.show.id,
    name: show.show.name,
    summ: show.show.summary,
    img: show.show.image.original || MISSING_IMG_URL,
    }
  })

  return showsCollection;
}


/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.img}
              alt="image for ${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summ}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodesUrl = `${EPISODES_BASE_URL}${id}/episodes`
  const episodes = await axios.get(episodesUrl);

  const episodesInfo = episodes.data.map(episode => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
  })

  return episodesInfo;
}

/** Append all episodes to episode area as a list
 * with info on name, season, and ep number
 */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    let $episode = $(
      `<li>${episode.name} (season ${episode.season},
          number ${episode.number})</li>`
    )

    $episodesList.append($episode);
  }
}

/** on click of the episode button, get show ID
 * and add episodes to the DOM */

async function getEpisodesAndDisplay(evt) {
  $episodesArea.show();
  const id = $(evt.target).parent().parent().parent().data("show-id");

  const episodesInfo = await getEpisodesOfShow(id);
  populateEpisodes(episodesInfo);
}

$showsList.on("click", "button", getEpisodesAndDisplay)
