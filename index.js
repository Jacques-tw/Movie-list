const base_url = 'https://webdev.alphacamp.io'
const index_url = base_url + '/api/movies/'
const poster_url = base_url + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

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
              <button class="btn btn-info btn-add-favorite" data-id="${element.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  });
  //這裡把電影的id綁在了see more的按鈕上

  dataPanel.innerHTML = rawHTML
}

//page -> 該page該出現MOVIES_PER_PAGE數量的電影
function getMoviesByPage(page) {
  //三元運算子-> 條件？true回傳:false回傳
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //slice切出的index不包含end
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
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

function addToFavorite(id) {
  //目的：將使用者點擊到的那一部電影送進 local storage 儲存起來
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  //防呆：已加入收藏名單中的電影，跳出警告
  if (list.some(movie => movie.id === id)) {
    return alert('Already added to favorite!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//綁監聽器在data-panel
dataPanel.addEventListener('click', function clickSeeMore(e) {
  if (e.target.matches('.btn-show-movie')) {
    showModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})

//綁監聽器在search-form
searchForm.addEventListener('submit', function submitForm(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('Invalid.')
  // } 希望搜尋欄為空時，可以看到所有電影

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movie with: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

paginator.addEventListener('click', function clickPaginator(e) {
  //防呆
  if (e.target.tagName !== 'A') return

  const page = Number(e.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

axios
  .get(index_url)
  .then(response => {
    movies.push(...response.data.results)
    // ...是展開運算子，可用來展開陣列元素
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch(error => {
    console.log(error)
  })