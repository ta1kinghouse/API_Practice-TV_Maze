"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(search) {
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${search}`);
  let shows = res.data.map((result) => {
    let show = res.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image
        ? show.image.medium
        : `https://images.app.goo.gl/rGdZEek5SsNSVQW18`,
    };
  });
  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}
              class="media-img-top">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );
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
  const res = await axios.get(`https://api.tvmaze.com/seasons/${id}/episodes`);
  let episodes = res.data.map((episode) => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    };
  });
  return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  const $episodesList = $("episodes-list");
  $episodesList.empty();
  for (let episode of episodes) {
    let $item = $(
      `<li>
        "${episode.id} (season ${episode.season}, number ${episode.number})"
       </li>
      `
    );
    $episodesList.append($item);
  }
  $episodesArea.show();
}

//Upon the button of a show being clicked, the episodes of the show are shown
$showsList.on("click", ".getEpisodes", async function (e) {
  let showId = $(e.target).closest(".Show").data("show-id");
  let episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});
