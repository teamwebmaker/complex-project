import { API_URL, RATING_INTERVAL} from './config.js' 
import { modalPopup } from './services.js'
import { $getTemplateContentById, $render, $uuid, $insertHtml, $getById, urlBuilder, $renderFragment} from './helpers.js'
import { modal, posts, dialogBox} from './dom.js'
import { _post_, _get_, _update_, _delete_} from './http.js'
import { insert, select } from './storage.js'
import { _option, _post, _comment, _wrapped, _alert, _tableRow } from './components.js'

const showModal = (e) => {
    const {template} = e.dataset
    const selector = [template , "template"].join("-")
    const templateContent = $getTemplateContentById(selector)
    $renderFragment(modal?.querySelector(".modal-body"), templateContent)
    // const children = [...modal?.querySelector(".modal-body").children]
    // children.forEach((child) =>  child.remove())
    // modal?.querySelector(".modal-body")?.appendChild(templateContent)
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
    $renderFragment(modal?.querySelector(".modal-body"), templateContent)
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
        $insertHtml(posts, 'afterbegin', _wrapped("div", _post({...post, category: category.title}), ["col-lg-4", "col-md-2", "sm-6", "mb-4"]))
    }
}
const CreateComment = async (e) => {
    const {template, postId} = e.dataset
    const selector = [template , "template"].join("-")
    const templateContent = $getTemplateContentById(selector)
    templateContent.querySelector('[name="post_id"]').value = postId
    $renderFragment(modal?.querySelector(".modal-body"), templateContent)
    modalPopup.show()
}

const storeComment = async (e) => {
    e.preventDefault()
    e.stopPropagation()
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
    const baseUrl = `${API_URL}/posts/${postId}`
    const url = urlBuilder(baseUrl, {_embed: "comments"})
    // const url = `${API_URL}/posts/${postId}?_embed=comments`
    const post = await _get_(url)
    
    const comments = await Promise.all( post.comments.map( async (comment) => {
        const user = await _get_(`${API_URL}/users/${comment.userId}`)
        return {...comment, email: user.email }
    }) )
    const admin = localStorage.hasOwnProperty('admin') ? select('admin')[0] : null
    
    const commentsTemplates = comments.map((comment) => _comment({...comment, admin}))
    const cardBody = _wrapped("div", _post({...post, showCommentBlock: false}), ["card-body"])
    const cardFooter = _wrapped("div", commentsTemplates.join(""), ["card-footer"])
    const card = _wrapped("div", [cardBody, cardFooter].join(""), ["card"])
    
    $render(modal?.querySelector(".modal-body"), card)
    modalPopup.show()
    //TODO => views
    const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
    delete post.comments
    let isAuth = false;
    if (localStorage.hasOwnProperty('admin')) isAuth = true
    const updatedPost = {...post, isAuth, category: category.title, showCommentBlock: true, views: post.views + 1, rating: setRating(post.views + 1, RATING_INTERVAL)}
    const result = await _update_(baseUrl, updatedPost)
    if(result) {
        const updatedComponent = $getById(postId)
        updatedComponent?.classList.add("d-none")
        const newComponent = _post(updatedPost)
        $insertHtml(updatedComponent, "afterend", newComponent)
        updatedComponent?.remove()
    }
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
        e.disabled = true
        const url = `${API_URL}/comments/${id}`
        if(_delete_(url)) $getById(id)?.remove() 
    }
}
const showUserPosts = async (e) => {
    const {userId} = e.dataset
    const url = urlBuilder(`${API_URL}/users/${userId}`, {_embed: "posts"})
    // const url = `${API_URL}/users/${userId}?_embed=posts`
    const user = await _get_(url)
    const posts = user.posts.map((post) => _tableRow(post)).join("")
    $render(modal?.querySelector(".modal-body"), _wrapped("table", posts, ["table"]))
    modalPopup.show()
}
const deletePost = async (e) => {
    if (confirm (`Are you sure you want to delete`)) { 
        const {postId} = e.dataset
        e.disabled = true
        const url = `${API_URL}/posts/${postId}`
        const result = await _delete_(url)
        if(result) $getById(postId)?.remove()
    }
}
const editPost = async (e) => {
    const {postId, template} = e.dataset
    const selector = [template , "template"].join("-")
    const templateContent = $getTemplateContentById(selector)
    const {title, description, category_id, post_id} = templateContent.querySelector("form")
    const postUrl = `${API_URL}/posts/${postId}`
    const post = await _get_(postUrl)
    const categoriesUrl = `${API_URL}/categories`
    const categories = await _get_(categoriesUrl)
    const category = categories.find((category) => category.id === post.categoryId)
    $render(category_id, categories.map((category) => _option({id:$uuid(), key:category.id, value:category.title })))
    // TODO => Filling the form with the received data
    title.value = post.title
    description.value = post.description
    category_id.value = category.id
    post_id.value = postId
    $renderFragment(modal?.querySelector(".modal-body"), templateContent)
    modalPopup.show()
}

const updatePost = async (e) => {
    e.preventDefault()
    const { category_id, title, description, post_id} = e.target 
    const post = await _get_(`${API_URL}/posts/${post_id.value}`)
    const updatedPost = {
        ...post, 
        categoryId : category_id.value.trim(),
        title : title.value.trim(),
        description : description.value.trim(),
    }
    const result = await _update_(`${API_URL}/posts/${post_id.value}`, updatedPost )
    if(result)  {
        const oldComponent = $getById(post_id.value)
        oldComponent?.classList.add("d-none")
        const category = await _get_(`${API_URL}/categories/${category_id.value.trim()}`)
        $insertHtml(oldComponent, 'beforebegin', _post( {...updatedPost, category: category.title, isAuth:true, showCommentBlock: true}) )
        oldComponent?.remove()
        e.target.reset()
        modalPopup.hide()
    }
}
const logOut = () => { 
    localStorage.removeItem("admin")
    window.location.reload()
}

const filtered = async (e) => {
    const categoryId = e.value
    let isAuth = false;
    let allPosts = []
    if (localStorage.hasOwnProperty('admin')) isAuth = true
    if (categoryId === "all"){
        const postsUrl = `${API_URL}/posts`
        allPosts = await _get_(postsUrl)
    } else {
        const categoryUrl = urlBuilder(`${API_URL}/categories/${categoryId}`, {_embed: "posts"})
        // const categoryUrl = `${API_URL}/categories/${categoryId}?_embed=posts`
        const category = await _get_(categoryUrl)
        allPosts = category.posts
    }
    const postsList = await Promise.all( allPosts.map( async (post) => {
        const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        return {...post, category: category.title, isAuth, showCommentBlock: true}
    }) )
    $render(posts, postsList
        .map(post => _post(post))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )
}
const sorted = async (e) => {
    const order = e.value
    let isAuth = false;
    if (localStorage.hasOwnProperty('admin')) isAuth = true
    const categoryUrl = urlBuilder(`${API_URL}/posts`, { _sort: "views", _order: order })
    // const url = `${API_URL}/posts?_sort=views&_order=${order}`
    let postsList = await _get_(categoryUrl)
    postsList = await Promise.all( postsList.map( async (post) => {
    const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
        return {...post, category: category.title, isAuth, showCommentBlock: true}
    }))
    $render(posts, postsList
        .map(post => _post(post))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )
}
const setRating = (views, interval) => {
    const ratingIndex = views / interval
    let rating = 0
    if(ratingIndex >= 1) rating = 1
    if(ratingIndex >= 2) rating = 2
    if(ratingIndex >= 3) rating = 3
    if(ratingIndex >= 4) rating = 4
    if(ratingIndex >= 5) rating = 5
    if(ratingIndex >= 6) rating = 6
    if(ratingIndex >= 7) rating = 7
    if(ratingIndex >= 8) rating = 8
    if(ratingIndex >= 9) rating = 9
    if(ratingIndex >= 10) rating = 10
    return rating
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
    showUserPosts,
    deletePost,
    editPost,
    updatePost,
    logOut,
    filtered,
    sorted
    
} 