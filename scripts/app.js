import { select } from './storage.js';
import {_dashboardLogIn, _dashboardLogOut, _actionsDashboard, _post, _wrapped } from './components.js';
import { $render} from './helpers.js';
import { adminDashboard, actionsDashboard, posts} from './dom.js';
import { _get_ } from './http.js';
import { API_URL } from './config.js';

window.addEventListener('DOMContentLoaded', async()=> {
    if (localStorage.hasOwnProperty('admin')) {
        const [admin] = select('admin')
        $render(adminDashboard,_dashboardLogOut(admin))
        $render (actionsDashboard, _actionsDashboard({}))
    } else {
        $render(adminDashboard,_dashboardLogIn({}))
    }

    let postsList = await _get_(`${API_URL}/posts`)
    postsList = await Promise.all( postsList.map( async (post) => {
        const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        return {...post, category: category.title }
    }) )

    $render(posts, postsList
        .map(post => _post(post))
        .map(post => _wrapped(post, ["col-lg-4", "col-md-2", "sm-6"]))
        )
    
})