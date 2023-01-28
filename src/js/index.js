import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import LoadBtn from './load-button';
import ImagesApiService from './imageApiService';

import imageCardTpl from '../templates/imageCard.hbs';
import { Notify } from 'notiflix';

const lightboxOptions = {
  scrollZoom: false,
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  showCounter: false,
};

const messages = {
  enterRequest: 'Please enter your request in the search box',
  endOfResults: "We're sorry, but you've reached the end of search results.",
  noMatches:
    'Sorry, there are no images matching your search query. Please try again.',

  successfulSearch(hits) {
    return `Hooray! We found ${hits} images.`;
  },
};

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

const lightbox = new SimpleLightbox('.gallery a', lightboxOptions);
const imagesApiService = new ImagesApiService();
const loadMoreBtn = new LoadBtn('.load-more');
const searchBtn = new LoadBtn('.search-btn');

refs.form.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', onLoadMore);

async function onSearch(evt) {
  evt.preventDefault();
  imagesApiService.query = evt.target.searchQuery.value;

  loadMoreBtn.hide();
  resetGallery();

  if (!imagesApiService.query.trim()) {
    Notify.info(messages.enterRequest);

    return;
  }

  searchBtn.disable();
  imagesApiService.resetPage();

  await imagesApiService
    .fetchImages()
    .then(dataChecker)
    .then(renderMarkup)
    .catch(errorProcessing)
    .finally(searchBtn.enable.bind(searchBtn));

  evt.target.reset();
}

async function onLoadMore() {
  loadMoreBtn.disable();
  imagesApiService.incrementPage();

  await imagesApiService
    .fetchImages()
    .then(renderMarkup)
    .then(dataChecker)
    .catch(errorProcessing)
    .finally(loadMoreBtn.enable.bind(loadMoreBtn));

  onLoadMoreScroll();
  lightbox.refresh();
}

function renderMarkup(data) {
  refs.gallery.insertAdjacentHTML('beforeend', imageCardTpl(data.hits));
  lightbox.refresh();

  return data;
}

function errorProcessing(error) {
  Notify.failure(error.message);
  resetGallery();
}

function dataChecker(data) {
  if (!data.totalHits) {
    throw new Error(messages.noMatches);
  }

  imagesApiService.page === 1 &&
    Notify.success(messages.successfulSearch(data.totalHits));

  if (data.totalHits <= imagesApiService.page * imagesApiService.perPage) {
    loadMoreBtn.hide();

    imagesApiService.page > 1 && Notify.info(messages.endOfResults);

    return data;
  }

  loadMoreBtn.show();
  return data;
}

function resetGallery() {
  if (refs.gallery.children.length > 0) {
    refs.gallery.innerHTML = '';
  }
}

function onLoadMoreScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
