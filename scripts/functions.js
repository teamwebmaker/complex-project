import { modalPopup } from './services.js'
import { $getTemplateContentById, $render, $uuid, $insertHtml, $getById} from './helpers.js'
import { modal, posts, dialogBox} from './dom.js'
import { _post_, _get_, _update_, _delete_} from './http.js'
import { API_URL } from './config.js' 
import { insert, select } from './storage.js'
import { _option, _post, _comment, _wrapped, _alert } from './components.js'

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
        const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        $insertHtml(posts, _post({...post, category}))
    }
}
const CreateComment = async (e) => {
    const {template, postId} = e.dataset
    const selector = [template , "template"].join("-")
    const templateContent = $getTemplateContentById(selector)
    templateContent.querySelector('[name="post_id"]').value = postId
    const children = [...modal?.querySelector(".modal-body").children]
    children.forEach((child) =>  child.remove())
    modal?.querySelector(".modal-body")?.appendChild(templateContent)
    modalPopup.show()
}

const storeComment = async (e) => {
    e.preventDefault()
    const {post_id, comment} = e.target
    const [admin] = select('admin')
    const newComment = {
        id: $uuid(),
        userId: admin.id, 
        postId: post_id.value, 
        comment: comment.value
    }
    const result = await _post_(`${API_URL}/comments`, newComment)
    if(result)  {
        e.target.reset()
        modalPopup.hide()
    }

}
const viewComments = async (e) => {
    const {postId} = e.dataset
    const url = `${API_URL}/posts/${postId}?_embed=comments`
    const post = await _get_(url)

    const comments = await Promise.all( post.comments.map( async (comment) => {
        const user = await _get_(`${API_URL}/users/${comment.userId}`)
        return {...comment, email: user.email }
    }) )
    const admin = localStorage.hasOwnProperty('admin') ? select('admin')[0] : null
    
    const commentsTemplates = comments.map((comment) => _comment({...comment, admin}))
    const children = [...modal?.querySelector(".modal-body").children]
    children.forEach((child) =>  child.remove())

    const cardBody = _wrapped(_post(post), ["card-body"])
    const cardFooter = _wrapped(commentsTemplates.join(""), ["card-footer"])
    const card = _wrapped([cardBody, cardFooter].join(""), ["card"])
    
    $render(modal?.querySelector(".modal-body"), card)
    modalPopup.show()
}
const userMessage = () => {
    $render(dialogBox, _alert({id: $uuid(), status: "danger", message: "please log in if you want to add comment"}))
    setTimeout(()=> {
        $render(dialogBox, "")
    }, 3000)
}

const deleteComment = (e) => { 
    if(confirm(`Are you sure you want to delete this comment`)) {
        const {id} = e.dataset
        const url = `${API_URL}/comments/${id}`
        if(_delete_(url)) {
            $getById(id)?.remove() 
        } 
    }
}

const logOut = () => { 
    localStorage.removeItem("admin")
    window.location.reload()
}

export { 
    showModal, 
    registration,
    authorization, 
    createPost,
    storePost,
    storeComment,
    CreateComment,
    viewComments,
    userMessage,
    deleteComment,
    logOut,
    
} 