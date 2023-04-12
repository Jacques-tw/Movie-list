const base_url = 'https://webdev.alphacamp.io'
const index_url = base_url + '/api/movies/'
const poster_url = base_url + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rawHTML = ``
  // 用來存放等等從陣列裡取出的資料

  // process:
  // 1. 產生80部電影的HTML結構 => 用for迴圈迭代
  // 2. 把取得的api資料放進結構裡 => 用template literal嵌套字串與變數
  data.forEach(element => {
    // 要替換image和title
    // console.log(element)
    rawHTML +=
      `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${poster_url + element.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${element.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${element.id}">See
                more</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${element.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  });
  //這裡把電影的id綁在了see more的按鈕上

  dataPanel.innerHTML = rawHTML
}

function showModal(id) {
  //找到以下資訊：image/ title/ release date/ director/ description 
  const modalTitle = document.querySelector('#modal-movie-title')
  const modalImage = document.querySelector('#modal-movie-image')
  const modalDate = document.querySelector('#modal-movie-date')
  const modalDirector = document.querySelector('#modal-movie-director')
  const modalDescription = document.querySelector('#modal-movie-description')

  axios
    .get(index_url + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDirector.innerText = 'Director: ' + data.director
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${poster_url + data.image}" alt="Movie Poster" class="img-fluid">`
    })
}

function removeFromFavorite(id) {
  const movieIndex = movies.findIndex(movie => movie.id === id)
  //因為等等要用splice()，需要1.從第幾個刪除/ 2.刪掉幾個
  //所以會用到findIndex()，回傳的值是在陣列中的位置
  //若查無資料，會回傳-1
  if (!movies || !movies.length) return //防錯：一旦傳入的 id 在收藏清單中不存在，或收藏清單是空的，就結束函式
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  //更新頁面
  renderMovieList(movies)
}

//綁監聽器在data-panel
dataPanel.addEventListener('click', function clickSeeMore(e) {
  if (e.target.matches('.btn-show-movie')) {
    showModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(e.target.dataset.id))
  }
})

renderMovieList(movies)