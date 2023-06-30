import { modalPopup } from './services.js'
import { $getTemplateContentById, $uuid} from './helpers.js'
import { modal } from './dom.js'
import { _post_ } from './http.js'
import { API_URL } from './config.js' 
import { insert } from './storage.js'

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

const logOut = () => { 
    localStorage.removeItem("admin")
    window.location.reload()
}

export { showModal, registration, logOut } 