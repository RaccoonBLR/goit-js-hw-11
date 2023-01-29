import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '33017242-7d5f5a8909ddfb3221f0bb8f6';
const imageType = 'photo';
const orientation = 'horizontal';
const safesearch = false;

export default class imagesApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.perPage = 40;
  }

  async fetchImages() {
    const url = `${BASE_URL}?key=${API_KEY}&q=${this.searchQuery}&page=${this.page}&per_page=${this.perPage}&image_type=${imageType}&orientation=${orientation}&safesearch=${safesearch}`;

    return await axios.get(url);
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newSearchQuery) {
    this.searchQuery = newSearchQuery;
  }
}
