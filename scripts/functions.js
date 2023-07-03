import { modalPopup } from './services.js'
import { $getTemplateContentById, $render, $uuid} from './helpers.js'
import { modal } from './dom.js'
import { _post_, _get_} from './http.js'
import { API_URL } from './config.js' 
import { insert, select } from './storage.js'
import { _option } from './components.js'

const showModal = (e) => {
    const {template} = e.dataset
    const selector = [template , "template"].join("-")
    const templateContent = $getTemplateContentById(selector)
    const children = [...modal?.querySelector(".modal-body").children]
    children.forEach((child) =>  child.remove())
    modal?.querySelector(".modal-body")?.appendChild(templateContent)
    modalPopup.show()
    
}

const registration = async (e) => {
    e.preventDefault() // block event classic action 
    const {email, password, repeat_password} = e.target
    const errors = []
    if (password.value.trim() !== repeat_password.value.trim()) errors.push("passwords does not match")
    if (password.value.trim().length < 6) errors.push("password must be at least 6 characters")
    if (!errors.length) {
        const user = {
            id: $uuid(),
            email: email.value.trim(),
            password: password.value.trim()
        }
        const result = await _post_(`${API_URL}/users`, user)
        if(result) {
            delete user.password
            insert ("admin", user)
            window.location.reload()
        }
    }
}

const authorization = async (e) => {
    e.preventDefault()
    const {email, password} = e.target
    const errors = []
    const url = new URL(`${API_URL}/users`);
    url.searchParams.set('email', email.value.trim())
    url.searchParams.set('password', password.value.trim())
    const users = await _get_(url)
    if(users.length) {
        const [user] = users
        delete user.password
        insert ("admin", user)
        window.location.reload()
    }
}

const createPost = async (e) => {
    const categories = await _get_(`${API_URL}/categories`)
    const {template} = e.dataset
    const selector = [template , "template"].join("-")
    const templateContent = $getTemplateContentById(selector)
    $render(templateContent.querySelector('select'), categories.map((category) => _option({id:$uuid(), key:category.id, value:category.title })))
    const children = [...modal?.querySelector(".modal-body").children]
    children.forEach((child) =>  child.remove())
    modal?.querySelector(".modal-body")?.appendChild(templateContent)
    modalPopup.show()
}

const storePost = async (e) => {
    e.preventDefault()
    const { category_id, title, description} = e.target
    const post = {
        id: $uuid(), 
        userId: select('admin')[0].id,
        categoryId: category_id.value.trim(),
        title: title.value.trim(), 
        description: description.value.trim(), 
        rating: 0,
        views: 0,
        tags: ['html','css','js']
    }
    const result = await _post_(`${API_URL}/posts`, post)
    if(result)  {
        e.target.reset()
        modalPopup.hide()

    }
}

const logOut = () => { 
    localStorage.removeItem("admin")
    window.location.reload()
}

export { showModal, registration,authorization, createPost,storePost, logOut } 