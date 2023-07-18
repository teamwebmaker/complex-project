import { API_URL, PRE_PAGE, RATING_INTERVAL, ADDITIONAL_PARAMS} from './config.js' 
import { modalPopup } from './services.js'
import { $getTemplateContentById, $render, $uuid, $insertHtml, $getById, urlBuilder, $renderFragment} from './helpers.js'
import { modal, posts, dialogBox, searchField, pagination} from './dom.js'
import { _post_, _get_, _update_, _delete_} from './http.js'
import { insert, select } from './storage.js'
import { _option, _post, _comment, _wrapped, _alert, _tableRow, _spinner, _page  } from './components.js'


const updatePostsOptions = async () => {
    const postsList = await _get_(urlBuilder(`${API_URL}/posts`, {_expand: "category", isPublished: true})) 
    pagesGeneration(postsList.length, PRE_PAGE)
    $render(posts, postsList.slice(0, PRE_PAGE)
        .map(post => _post({...post, ...ADDITIONAL_PARAMS }))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )
}

const incrementViews = async (postId) => {
    const url = urlBuilder(`${API_URL}/posts/${postId}`, {_expand: "category"})
    const post = await _get_(url)
    const {category} = post
    delete post.category
    const updatedPost = {...post, views: (post.views + 1)}
    const result = await _update_(url, updatedPost)
    if(result) {
        const updatedComponent = $getById(postId)
        updatedComponent?.classList.add("d-none")
        const newComponent = _post({...updatedPost, ...ADDITIONAL_PARAMS,category})
        $insertHtml(updatedComponent, "afterend", newComponent)
        updatedComponent?.remove()
    }
}

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
    const { category_id, title_ka, title_en, description_ka, description_en, tags, published} = e.target
    let isPublished = [...published].find((item) => item.checked)
    isPublished = Number(isPublished.value) ? true : false
    const tagsList = [...tags]
    const selectedTags = []
    tagsList.forEach((tag) => {
        if(tag.checked) selectedTags.push(tag.value)
    })
    
    const post = {
        id: $uuid(), 
        userId: select('admin')[0].id,
        categoryId: category_id.value.trim(),
        title: {
            ka: title_ka.value.trim(),
            en: title_en.value.trim(),
        }, 
        description: {
            ka: description_ka.value.trim(),
            en: description_en.value.trim()
        },
        rating: 0,
        views: 0,
        tags: selectedTags,
        isPublished
    }
    const result = await _post_(`${API_URL}/posts`, post)
    if(result)  {
        e.target.reset()
        modalPopup.hide()
        await updatePostsOptions()
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
    const url =  urlBuilder(baseUrl, {_expand: "category", _embed: "comments"})
    const post = await _get_(url)
    
    const comments = await Promise.all( post.comments.map( async (comment) => {
        const user = await _get_(`${API_URL}/users/${comment.userId}`)
        return {...comment, email: user.email }
    }) )
    const admin = localStorage.hasOwnProperty('admin') ? select('admin')[0] : null
    console.log({...post, ...ADDITIONAL_PARAMS})
    const commentsTemplates = comments.map((comment) => _comment({...comment, admin}))
    const cardBody = _wrapped("div", _post({...post, ...ADDITIONAL_PARAMS}), ["card-body"])
    const cardFooter = _wrapped("div", commentsTemplates.join(""), ["card-footer"])
    const card = _wrapped("div", [cardBody, cardFooter].join(""), ["card"])
    
    $render(modal?.querySelector(".modal-body"), card)
    modalPopup.show()
    //TODO => views
    incrementViews(postId)
}
/**
 * 
 * @param {{ id: string, status: string, message: string}} _ 
 */
const displayMessage = (_) => {
    const {id, status, message} = _
    $render(dialogBox, _alert({id, status, message}))
    setTimeout(()=> {
        $render(dialogBox, "")
    }, 3000)
}

const componentAlert = () => {
    displayMessage({id: $uuid(), status: "danger", message: "Please Auth for Comment This post"})
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
    const posts = user.posts.map((post) => _tableRow({...post, language : localStorage.getItem('language')})).join("")
    $render(modal?.querySelector(".modal-body"), _wrapped("table", posts, ["table"]))
    modalPopup.show()
}
const deletePost = async (e) => {
    if (confirm (`Are you sure you want to delete`)) { 
        const {postId} = e.dataset
        e.disabled = true
        const url = `${API_URL}/posts/${postId}`
        const result = await _delete_(url)
        if(result) {
            $getById(postId)?.remove()
            await updatePostsOptions()
        }
    }
}
const editPost = async (e) => {
    const {postId, template} = e.dataset
    const selector = [template , "template"].join("-")
    const templateContent = $getTemplateContentById(selector)
    const {title_ka, title_en, description_ka, description_en, tags, category_id, post_id} = templateContent.querySelector("form")
    const postUrl = `${API_URL}/posts/${postId}`
    const post = await _get_(postUrl)
    const categoriesUrl = `${API_URL}/categories`
    const categories = await _get_(categoriesUrl)
    const category = categories.find((category) => category.id === post.categoryId)
    $render(category_id, categories.map((category) => _option({id:$uuid(), key:category.id, value:category.title })))
    // TODO => Filling the form with the received data
    const tagLists = [...tags]
    tagLists.forEach((tag) => {
        if(post.tags.includes(tag.value)) tag.checked = true
    })

    title_ka.value = post.title.ka
    title_en.value = post.title.en
    description_ka.value = post.description.ka
    description_en.value = post.description.en
    category_id.value = category.id
    post_id.value = postId
    $renderFragment(modal?.querySelector(".modal-body"), templateContent)
    modalPopup.show()
}

const updatePost = async (e) => {
    e.preventDefault()
    const { category_id, title_ka, title_en, description_ka,description_en, tags, post_id} = e.target 
    const post = await _get_(urlBuilder(`${API_URL}/posts/${post_id.value}`,{_expand: "category"}))
    const {category} = post
    delete post.category
    const tagsList = [...tags]
    const selectedTags = []
    tagsList.forEach((tag) => {
        if(tag.checked) selectedTags.push(tag.value)
    })
    const updatedPost = {
        ...post, 
        categoryId : category_id.value.trim(),
        title: {
            ka: title_ka.value.trim(),
            en: title_en.value.trim()
        },
        description: {
            ka : description_ka.value.trim(), 
            en : description_en.value.trim()
        },
        tags: selectedTags
    }
    const result = await _update_(`${API_URL}/posts/${post_id.value}`, updatedPost )
    if(result)  {
        const oldComponent = $getById(post_id.value)
        oldComponent?.classList.add("d-none")
        const category = await _get_(`${API_URL}/categories/${category_id.value.trim()}`)
        $insertHtml(oldComponent, 'beforebegin', _post( {...updatedPost, ...ADDITIONAL_PARAMS, category}) )
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
    let isAuth = localStorage.hasOwnProperty('admin')
    let allPosts = []
    if (categoryId === "all"){
        allPosts = await _get_(urlBuilder(`${API_URL}/posts`,{isPublished: true}))
    } else {
        const postsUrl = urlBuilder(`${API_URL}/categories/${categoryId}`, {_expand: "category", isPublished: true})
        allPosts = await _get_(postsUrl)
        allPosts = allPosts.filter((post) => post.categoryId === categoryId)
    }
    
    $render(posts, allPosts
        .map(post => _post({...post,...ADDITIONAL_PARAMS}))
        .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
        )
}
const sorted = async (e) => {
    const order = e.value
    let isAuth = localStorage.hasOwnProperty('admin')
    const categoryUrl = urlBuilder(`${API_URL}/posts`, { _sort: "views", _order: order,_expand: "category",isPublished: true })
    // const url = `${API_URL}/posts?_sort=views&_order=${order}`
    let postsList = await _get_(categoryUrl)
    
    $render(posts, postsList
        .map(post => _post({...post,...ADDITIONAL_PARAMS}))
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

const search = async (e) =>{
    e.disabled = true
    $render(e, _spinner({id:$uuid(), status:"primary" }))
    const searchValue = searchField?.value.trim() 
    setTimeout(async () => {
        if(searchValue.length >= 3){
            let isAuth = localStorage.hasOwnProperty('admin')
            const searchUrl = urlBuilder(`${API_URL}/posts`, {q:searchValue, isPublished: true})
            let postsList = await _get_(searchUrl)
            if(postsList.length){
        
                $render(posts, postsList
                    .map(post => _post({...post, ...ADDITIONAL_PARAMS}))
                    .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
                    )
                }else{
                    displayMessage({id:$uuid(), status:"warning", message:"This word dose not match any post" })
            }
    
        }else{
            displayMessage({id:$uuid(), status:"warning", message:"please insert 3 simbols for search" })
        }
        e.disabled = false
        $render(e,"search")

    }, 1000)
}
const pagesGeneration = (total, limit) => {
    const pages = Math.ceil(total / limit)
    const pageComponents = []
    for(let i = 1; i <= pages; i++) pageComponents.push(_page({id:$uuid(),  page: i}))
    $render(pagination, pageComponents.join(""))
}
const paginate = async (e) => {
    let isAuth = localStorage.hasOwnProperty('admin')
    const paginationButtons = [...pagination?.children]
    paginationButtons.forEach((child) =>  child.disabled = false)
    e.disabled = true
    $render(e, _spinner({id:$uuid(), status:"primary" }))
    const {page} = e.dataset
    const url = urlBuilder(`${API_URL}/posts`, {_page: page, _limit: PRE_PAGE,_expand: "category"})
    setTimeout( async () => {
        const postsList = await _get_(url)
    
        $render(posts, postsList
            .map(post => _post({...post, ...ADDITIONAL_PARAMS }))
            .map(post => _wrapped("div", post, ["col-lg-4", "col-md-2", "sm-6", "mb-4"])).join("")
            )
        $render(e, page)
    }, 1000)
}

const languageSwitcher = (e) => {
    const {language} = e.dataset
    localStorage.setItem('language', language)
    window.location.reload()

}

const togglePublished = async (e) => {
    const {postId} = e.dataset
    const url = `${API_URL}/posts/${postId}`
    const post = await _get_(url)
    const updatedPost = {...post, isPublished: !post.isPublished}
    const result = _update_(url, updatedPost)
    if(result) {
        const selectedTd = $getById(`td-${postId}`)
        selectedTd?.classList.add(`d-none`)
        $insertHtml(selectedTd, "beforebegin", _tableRow({...updatedPost,language: localStorage.getItem('language')}))
        selectedTd?.remove()
        await updatePostsOptions()
    }
}



export { 
    showModal, 
    registration,
    authorization, 
    createPost,
    storePost,
    storeComment,
    CreateComment,
    componentAlert,
    viewComments,
    deleteComment,
    showUserPosts,
    deletePost,
    editPost,
    updatePost,
    logOut,
    filtered,
    sorted,
    search,
    pagesGeneration,
    paginate,
    languageSwitcher,
    togglePublished
} 