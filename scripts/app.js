import { select } from './storage.js';
import {_dashboardLogIn, _dashboardLogOut, _actionsDashboard, _post, _wrapped, _option } from './components.js';
import { $render, $uuid, $insertHtml, urlBuilder} from './helpers.js';
import { adminDashboard, actionsDashboard, posts, category, ratingPosts} from './dom.js';
import { _get_ } from './http.js';
import { API_URL } from './config.js';

window.addEventListener('DOMContentLoaded', async()=> {
    let isAuth = false;
    if (localStorage.hasOwnProperty('admin')) {
        const [admin] = select('admin')
        $render(adminDashboard,_dashboardLogOut(admin))
        $render (actionsDashboard, _actionsDashboard({}))
        isAuth = true;
    } else {
        $render(adminDashboard,_dashboardLogIn({}))
    }

    const categories = await _get_(`${API_URL}/categories`)
    $render(category, categories
        .map(category => _option({id: $uuid(), key: category.id, value: category.title})).join("")
        )
    $insertHtml(category, 'afterbegin', _option({id: $uuid(), key: 'all', value: 'All categories'}))

    let postsList = await _get_(`${API_URL}/posts`)
    postsList = await Promise.all( postsList.map( async (post) => {
        const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        return {...post, category: category.title, isAuth, showCommentBlock: true}
    }) )

    $render(posts, postsList
        .map(post => _post(post))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )
    // TODO => get rating posts
    const ratingPostsUrl = urlBuilder(`${API_URL}/posts`,{ _sort: `rating`, _order: `desc`, _limit:3})
    let ratingLimitedPosts = await _get_(ratingPostsUrl)
        ratingLimitedPosts = await Promise.all( ratingLimitedPosts.map( async (post) => {
        const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        return {...post, category: category.title, isAuth, showCommentBlock: true}
    }) )

    $render(ratingPosts , ratingLimitedPosts
        .map(post => _post(post))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )
    

})