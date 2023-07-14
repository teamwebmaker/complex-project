import { select } from './storage.js';
import {_dashboardLogIn, _dashboardLogOut, _actionsDashboard, _post, _wrapped, _option } from './components.js';
import { $render, $uuid, $insertHtml, urlBuilder, $qs} from './helpers.js';
import { adminDashboard, actionsDashboard, posts, category, ratingPosts, lastPosts} from './dom.js';
import { _get_ } from './http.js';
import { API_URL, PRE_PAGE, LANGUAGES } from './config.js';
import { pagesGeneration } from './functions.js'

window.addEventListener('DOMContentLoaded', async()=> {
    // check language
    let isAuth = false;
    let language = 'ka'
    if (localStorage.hasOwnProperty('language')) {
        const lang = localStorage.getItem('language');
        if(!LANGUAGES.includes(lang)) {
            localStorage.setItem('language',language)
        }
    }else{
        localStorage.setItem('language',language)
    }
    if (localStorage.hasOwnProperty('admin')) {
        const [admin] = select('admin')
        $render(adminDashboard,_dashboardLogOut(admin))
        $render (actionsDashboard, _actionsDashboard({}))
        isAuth = true;
    } else {
        $render(adminDashboard,_dashboardLogIn({}))
    }
// set active language
    $qs(`button[data-language="${localStorage.getItem('language')}"]`).classList.add('active')
    const categories = await _get_(`${API_URL}/categories`)
    $render(category, categories
        .map(category => _option({id: $uuid(), key: category.id, value: category.title})).join("")
        )
    $insertHtml(category, 'afterbegin', _option({id: $uuid(), key: 'all', value: 'All categories'}))

    let postsList = await _get_(`${API_URL}/posts`)
    postsList = await Promise.all( postsList.map( async (post) => {
        const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        return {...post, category: category.title, isAuth, showCommentBlock: true, language : localStorage.getItem('language') }
    }) )

    $render(posts, [...postsList].slice(0, PRE_PAGE)
        .map(post => _post(post))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )
    // TODO => get rating posts
    const ratingPostsUrl = urlBuilder(`${API_URL}/posts`,{ _sort: `rating`, _order: `desc`, _limit: PRE_PAGE})
    let ratingLimitedPosts = await _get_(ratingPostsUrl)
        ratingLimitedPosts = await Promise.all( ratingLimitedPosts.map( async (post) => {
        const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        return {...post, category: category.title, isAuth, showCommentBlock: true,  language : localStorage.getItem('language')}
    }) )

    $render(ratingPosts , ratingLimitedPosts
        .map(post => _post(post))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )

        const lastPostsUrl = urlBuilder(`${API_URL}/posts`,{ _start: postsList.length - PRE_PAGE, _end: postsList.length,})
    let lastPostsCollection = await _get_(lastPostsUrl)
    lastPostsCollection = await Promise.all( lastPostsCollection.map( async (post) => {
        const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        return {...post, category: category.title, isAuth, showCommentBlock: true, language : localStorage.getItem('language')}
    }) )

    $render(lastPosts , lastPostsCollection
        .map(post => _post(post))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )

        pagesGeneration(postsList.length, PRE_PAGE)

})