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
export {
    $getById, $qsAll, $qs, $insertHtml, $render, $getTemplateContentById, $uuid, isJson
}



