// TODO => DOM SHORTAGES
const $getById = (id) => document.getElementById(id)
const $qs = (selector) => document.querySelector(selector)
const $qsAll = (selector) => document.querySelectorAll(selector)
const $insertHtml = (element, position, content) => element.insertAdjacentHTML(position, content)
const $render = (element, content) => element.innerHTML = content
const $getTemplateContentById = (id) => $getById(id)?.content.cloneNode(true)
const $uuid = () => crypto.randomUUID().toString()
// TODO => Create Unique ID
const isJson = (str) => {
    try {
        JSON.parse(str);
    }catch (e){
        return false;
    }
    return true;
}
/**
 * 
 * @param {String} baseUrl 
 * @param {Object} params
 * @returns {String}
 */
const urlBuilder = (baseUrl, params) => {
    const options = Object.entries(params)
    const  url = new URL(baseUrl);
    options.forEach((option) => {
        const [key, value] = option
        url.searchParams.set(key, value);
    })
    return url.toString()
}
/**
 * 
 *  @param {HTMLElement} element 
 * @param {HTMLIFrameElement} fragment
 */
const $renderFragment = (element, fragment) => {
    const children = [...element.children]
    children.forEach((child) =>  child.remove())
    element.appendChild(fragment)
}
export {
    $getById, $qsAll, $qs, $insertHtml, $render, $getTemplateContentById, $uuid, isJson, urlBuilder, $renderFragment 
}



