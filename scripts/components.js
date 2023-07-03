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
 *          category:string}} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _post = (_) => {
    const {id, title, description, views, rating, tags, category} = _
    const tagsList = tags.map(tag => _tag({ id: $uuid(),title:tag }) ).join("")
    return `<div class="card ">
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
            <button type="button w-50" class="btn btn-success">view comments</button>
            <button type="button w-50" class="btn btn-warning">add comment</button>
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
export {
    _dashboardLogIn,
    _dashboardLogOut,
    _actionsDashboard,
    _option,
    _post,
    _wrapped
}