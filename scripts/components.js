import { $uuid } from "./helpers.js"

/**
 * 
 * @param {object} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _dashboardLogIn = (_) => {
    return `<div class="btn-group" role="group" aria-label="Basic example">
                <button type="button" class="btn btn-primary" data-template="registration" onclick="showModal(this)">registration</button>
                <button type="button" class="btn btn-warning" data-template="authorization" onclick="showModal(this)">authorization</button>
            </div>`
}
/**
 * 
 * @param {{id: string | number, email: string }} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _dashboardLogOut = (_) => {
    const {id, email } = _
    return `<div class="btn-group" role="group" aria-label="Basic example" id="${id}">
                <button type="button" class="btn btn-primary">${email}</button>
                <button type="button" class="btn btn-warning" onclick="logOut()">
                    <i class="bi bi-box-arrow-in-right"></i>
                </button>
            </div>`
}

/**
 * 
 * @param {object} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */

const _actionsDashboard = (_) => {
    const {id} = _
    return `<div class="btn-group" role="group" aria-label="Basic example" id="${id}">
                <button type="button" class="btn btn-primary" data-template="create-post" onclick="createPost(this)">Create Post</button>
            </div>`
}

/**
 * 
 * @param {{id: string, key: string, value: string}} _ 
 */

const _option = (_) => {
    const {id, key , value} = _
    return `<option value="${key}">${value}</option>`
}

/**
 * 
 * @param {{id:string, title:string}} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _tag = (_) => {
    const { id, title} = _
    return `<button type="button" class="btn btn-primary">${title}</button>`
}

/**
 * 
 * @param {{id:string, 
 *          title:string,
 *          description:string,
 *          views:number,
 *          rating:number,
 *          tags:string[],
 *          category:string,
 *          isAuth: boolean}} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _post = (_) => {
    const {id, title, description, views, rating, tags, category, isAuth} = _
    const tagsList = tags.map(tag => _tag({ id: $uuid(),title:tag }) ).join("")
    const commentAction = isAuth ? "CreateComment(this)" : "userMessage()"
    return `<div class="card ${category}">
    <div class="card-header">
        <h5 class="card-title">${title}</h5>
        <p class="card-description">${description}</p>
    </div>
    <div class="card-body">
        <ul class="list-group">
            <li class="list-group-item">rating: ${rating}</li>
            <li class="list-group-item">views: ${views}</li>
        </ul>
        <div class="btn-group py-2" role="group" aria-label="Basic example">
            ${tagsList}
        </div>
    </div>
    <div class="card-footer">
        <div class="btn-group w-100" role="group" aria-label="Basic example">
            <button type="button w-50" class="btn btn-success" data-post-id="${id}" data-template="" onclick="viewComments(this)">view comments</button>
            <button type="button w-50" class="btn btn-warning" data-post-id="${id}" data-template="create-comment" onclick="${commentAction}">add comment</button>
        </div>
    </div>
</div>`
}
/**
 * 
 * @param {string} content 
 * @param {string[]} classes 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _wrapped = (content, classes) => {
    return `<div class="${classes.join(" ")}">
                ${content}
            </div>`
}
/**
 * 
 * @param {{id:string, email:string, comment:string, admin:null | object}} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _comment = (_) => {
    const {id, email, comment, admin} = _
    let action = ""
    if(admin) {
        if(admin.email === email) {
            action = `<button type="button" class="btn btn-danger delete-comment" data-id="${id}" onclick="deleteComment(this)"><i class="bi bi-trash3"></i></button>`
        } 
    }
    return `<div class="card text-bg-success mb-2 p-2" id="${id}">
                ${action}
                <p class="user-email text-warning">${email}</p>
                <p class="card-text">${comment}</p>
            </div>`
}
/**
 * 
 * @param {{id:string, status: string, message: string}} _ 
 * @returns {string} 
 */
const _alert = (_) => {
    const {id, status, message} = _
    return `<div class="alert alert-${status}" id="${id}" role="alert">
                ${message}
            </div>`
}

export {
    _dashboardLogIn,
    _dashboardLogOut,
    _actionsDashboard,
    _option,
    _post,
    _wrapped,
    _comment,
    _alert
}