import { $getById } from "./helpers.js";

const modal = $getById("modal");
const adminDashboard = $getById("admin-dashboard");
const actionsDashboard = $getById("actions-dashboard");
const posts = $getById("posts");
const dialogBox = $getById("dialog-box")
const category = $getById("category");

export {
    modal, adminDashboard, actionsDashboard, posts, dialogBox, category
}