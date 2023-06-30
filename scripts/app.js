import { select } from './storage.js';
import {_dashboardLogIn, _dashboardLogOut } from './components.js';
import { $render} from './helpers.js';
import { adminDashboard} from './dom.js';
window.addEventListener('DOMContentLoaded', async()=> {
    if (localStorage.hasOwnProperty('admin')) {
        const [admin] = select('admin')
        $render(adminDashboard,_dashboardLogOut(admin))
    } else {
        $render(adminDashboard,_dashboardLogIn({}))
    }
})